/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2022  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import {createCanvas, loadImage} from "canvas";
import ZeppPlayer from "./ZeppPlayer.js";
import * as fs from 'fs';
import {ListDirectoryResponseEntry} from "./types/PlayerTypes";
import {CanvasEntry, ImageEntry} from "./types/EnvironmentTypes";

declare const __dirname: string;

export class NodeZeppPlayer extends ZeppPlayer {
    constructor() {
        super();

        // Create fake localStorage for persistent
        (globalThis as any).localStorage = {};
    }

    newCanvas() {
        return createCanvas(20, 20);
    }

    protected async listDirectory(path: string): Promise<ListDirectoryResponseEntry[]> {
        const out: ListDirectoryResponseEntry[] = [];
        const content = fs.readdirSync(path);

        for(let i in content) {
            const stat = fs.statSync(path + "/" + content[i]);
            out.push({
                name: content[i] + (stat.isDirectory() ? "/" : ""),
                type: stat.isDirectory() ? "dir" : "file"
            });
        }

        return out;
    }

    protected async loadFile(path: string) {
        if(path.startsWith("/app"))
            path = __dirname + "/" + path.substring(4);

        return fs.readFileSync(path);
    }

    protected async _loadPNG(data: ArrayBuffer): Promise<ImageEntry> {
        return loadImage(data as any);
    }

    protected getEvalAdditionalData(path: string): string {
        return "";
    }
}
