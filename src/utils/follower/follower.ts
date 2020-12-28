import { CursorProcessor } from "../cursor/cursor";


export class Follower {
    private cursorProcessor: CursorProcessor
    private cmd: string

    constructor(cursorProcessor: CursorProcessor, cmd: string) {
        this.cursorProcessor = cursorProcessor
        this.cmd = cmd
    }

    
}