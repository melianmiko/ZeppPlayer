import {createCanvas, loadImage, Image} from "canvas";
import ZeppPlayer from "./ZeppPlayer.js";
import TGA from "tga";
import * as fs from 'fs';
import { PersistentStorage } from "./PersistentStorage.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class NodeZeppPlayer extends ZeppPlayer {
    pathOverlay = __dirname + "/../overlay.png";

    constructor() {
        super();

        // Create fake localStorage for persistent
        global.localStorage = {};
        this.withScriptConsole = false;
    }

    getFileContent(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, "utf8", (err, data) => {
                if(err) return reject(err);
                resolve(data);
            });
        })
    }

    newCanvas() {
        return createCanvas(20, 20);
    }

    getAssetText(path) {
        if(PersistentStorage.get("appFs", path)) 
            return PersistentStorage.get("appFs", path);

        const fullPath = this.path_project + "/assets/" + path;
        return fs.readFileSync(fullPath, "utf8");
    }

    async getAssetImage(path, noprefix=false) {
        const fullPath = this.path_project + "/assets/" + path;
        try {
            const image = await loadImage(noprefix ? path : fullPath);
            return image;
        } catch(e) {
            return await this._loadTga(noprefix ? path : fullPath);
        }
    }

    _loadTga(fullPath) {
        return new Promise((resolve, reject) => {
            const tga = new TGA(fs.readFileSync(fullPath), {
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
