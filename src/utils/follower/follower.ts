import { CancellablePromise } from "../bluebird/promise";
import { CursorProcessor } from "../cursor/cursor";
import * as cp from 'child_process'
import Bluebird from "bluebird";

export class Follower {
    private cursorProcessor: CursorProcessor
    private cursorProcessorPromise: Bluebird<void> | undefined
    private cmd: string[]
    private started: boolean = false
    private onStop: (() => void) | undefined = undefined
    private ready: boolean = false

    constructor(cursorProcessor: CursorProcessor, cmd: string) {
        this.cursorProcessor = cursorProcessor
        this.cmd = cmd.trim().split(/[ ,]+/)
        if (this.cmd.length === 0) {
            throw new Error(`Empty cmd string`)
        }
    }

    /**
     * Returns a cancellable promise 
     * 
     * @param onReady Callback when the follower process is ready
     * @param onStop Callback when the follower process is stopped
     */
    public start = (onReady: () => void, onStop: () => void) => {
        if (this.started) {
            throw new Error(`Follower already started`)
        }
        return new CancellablePromise<void>(async (resolve, reject, onCancel) => {
            if (onCancel) {
                onCancel(() => {
                    console.debug(`Follower promise cancelled`)
                    if (this.onStop) {
                        console.debug(`Follower stopped`)
                        this.onStop()
                    }
                })
            }
            try {
                await this.runCmd(onReady, onStop)
                resolve()
            }
            catch (err) {
                reject(err)
            }
        })
    }

    /**
     * Processes (partial) stdout obtained from the follower process
     * 
     * @param data stdout string data
     * @param onReady Callback when the follower process is ready
     */
    private processStdout = async (data: string, onReady: () => void) => {
        const lines = data.split(/\r?\n/).map(s => s.trim())

        if (!this.ready) {
            if (lines.contains(`READY`)) {
                this.ready = true
                this.cursorProcessor.showCursor()
                onReady()
            }
        }

        if (this.ready) {
            const lastLineNumber = await getLastLineNumber(lines)
            if (lastLineNumber !== undefined) {
                if (this.cursorProcessorPromise) {
                    this.cursorProcessorPromise.cancel()
                }
                this.cursorProcessorPromise = this.cursorProcessor.moveCursor(lastLineNumber)
            }
        }
    }

    /**
     * Runs the follow command
     */
    private runCmd = async (onReady: () => void, onStop: () => void) => {
        return new Promise<void>((resolve, reject) => {
            const proc = cp.spawn(this.cmd[0], this.cmd.slice(1))
            console.debug(`spawned "${this.cmd.join(` `)}"`)

            this.onStop = () => {
                if (!proc.killed) {
                    proc.kill(`SIGKILL`)
                }
                if (this.cursorProcessorPromise) {
                    this.cursorProcessorPromise.cancel()
                    this.cursorProcessor.reset()
                }
                onStop()
            }

            let stderrData = ``;

            proc.stdout.on(`data`, (data) => {
                console.debug(`stdout: ${data}`)
                this.processStdout(data.toString(), onReady)
            })

            proc.stderr.on(`data`, (data) => {
                stderrData += data
            })

            proc.on(`close`, (code) => {
                console.debug(`Process exited with code ${code}`)

                if (this.onStop) this.onStop()

                if (code !== 0 && code !== null) {
                    console.error(`stderr: ${stderrData}`)
                    reject(`Process exited with code ${code}.`)
                }

                resolve()
            })
        })
    }
}


/**
 * Try to get a number in the last line given an array of string lines.
 * 
 * @param lines An array of lines
 */
export const getLastLineNumber = async (lines: string[]): Promise<number | undefined> => {
    for (let i = lines.length - 1; i >= 0; --i) {
        const l = lines[i]
        const num = parseFloat(l)
        if (!isNaN(num)) {
            return num
        }
    }
    return undefined
}
