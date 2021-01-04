import { readFileSync } from "fs";
import * as path from "path"

export const preludeTestFile = `prelude.musicxml`

export const getDivElement = (document: Document): HTMLElement => {
    const div: HTMLElement = document.createElement("div");
    const body: HTMLElement = document.getElementsByTagName("body")[0];
    body.appendChild(div);
    return div;
}

export const getScore = (scoreFileName: string): string => {
    return readFileSync(getAbsScorePath(scoreFileName), { encoding: `utf8` })
}

export const getAbsScorePath = (scoreFileName: string): string => {
    return path.join(__dirname, `..`, `..`, `test`, `testxml`, scoreFileName)
}
