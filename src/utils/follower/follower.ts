import Bluebird from 'bluebird'
import * as udp from 'dgram'
import { CancellablePromise } from '../bluebird/promise'
import { CursorProcessor } from '../cursor/cursor'
export class Follower {
    private cursorProcessor: CursorProcessor

    private cursorProcessorPromise: Bluebird<void> | undefined

    private port: number

    private started: boolean = false

    private ready: boolean = false

    constructor(cursorProcessor: CursorProcessor, port: number) {
        this.cursorProcessor = cursorProcessor
        this.port = port
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
        return new CancellablePromise<void>(
            async (resolve, reject, onCancel) => {
                try {
                    const server = await this.startServer(onReady, () => {
                        onStop()
                        server.close()
                        resolve()
                    })
                    if (onCancel) {
                        onCancel(() => {
                            server.close()
                            console.debug(`Follower promise cancelled`)
                            onStop()
                        })
                    }
                } catch (err) {
                    reject(err)
                }
            }
        )
    }

    /**
     * Start server
     *
     * @param onReady Callback when the follower process is ready
     * @param onStop Callback when the follower process is stopped
     */
    private startServer = async (
        onReady: () => void,
        onStop: () => void
    ): Promise<udp.Socket> => {
        const server = udp.createSocket(`udp4`)

        server.bind(this.port, `localhost`)

        server.on(`error`, (err) => {
            onStop()
            console.error(err)
        })

        server.on(`message`, (msg) => {
            // console.debug(`Received "${msg}"`)
            this.processLine(msg.toString(), onReady)
        })

        server.on(`listening`, () => {
            const serverAddress = server.address()
            const { port } = serverAddress
            const ipaddr = serverAddress.address
            console.debug(`Server listening at ${ipaddr}:${port}`)
        })

        return server
    }

    /**
     * Processes (partial) stdout obtained from the follower process
     *
     * @param data file data
     * @param onReady Callback when the follower process is ready
     * @param onStop Callback when the follower process is stopped
     */
    private processLine = async (line: string, onReady: () => void) => {
        if (!this.ready) {
            if (line === `READY`) {
                this.ready = true
                this.cursorProcessor.showCursor()
                onReady()
            }
        } else {
            if (this.cursorProcessorPromise) {
                this.cursorProcessorPromise.cancel()
            }

            const timestamp = parseFloat(line)
            this.cursorProcessorPromise = this.cursorProcessor.moveCursor(
                timestamp
            )
        }
    }
}
