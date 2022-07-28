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
import TGA from "tga";
import * as fs from 'fs';
import { PersistentStorage } from "./PersistentStorage.js";

export class NodeZeppPlayer extends ZeppPlayer {
    imgCache = {};

    constructor() {
        super();

        // Create fake localStorage for persistent
        global.localStorage = {};
        this.withScriptConsole = false;
    }

    async listDirectory(path) {
        const out = [];
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

    async loadFile(path) {
        if(path.startsWith("/app"))
            path = __dirname + "/" + path.substring(4);

        return fs.readFileSync(path);
    }

    newCanvas() {
        return createCanvas(20, 20);
    }

    async getAssetImage(path, noPrefix=false) {
        if(!noPrefix) path = this.getAssetPath(path);
        if(this.imgCache[path]) return this.imgCache[path];
        if(!this.readCache[path]) throw "Undefined asset";

        const data = this.readCache[path];
        const uint = new Uint8Array(data);

        let img;
        if(uint[1] === 1) {
            img = await this._loadTga(data);
        } else {
            img = await loadImage(data);
        }

        this.imgCache[path] = img;
        return img;
    }

    _loadTga(data) {
        return new Promise((resolve, reject) => {
            const tga = new TGA(data, {
                dontFixAlpha: true
            });

            const canvas = createCanvas(tga.width, tga.height);
            const ctx = canvas.getContext("2d");
            const newData = ctx.createImageData(tga.width, tga.height);
            for(var i = 0; i < tga.pixels.length; i++) {
                newData.data[i] = tga.pixels[i];
            }
            ctx.putImageData(newData, 0, 0);
            resolve(canvas);
        });
    }
}
