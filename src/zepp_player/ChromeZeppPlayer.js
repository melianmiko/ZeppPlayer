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

import ZeppPlayer from "./ZeppPlayer.js";

export class ChromeZeppPlayer extends ZeppPlayer {
    imgCache = {};

    constructor() {
        super();
        this.rotation = 0;
    }

    async loadFile(path) {
        const resp = await fetch(path);

        return await resp.arrayBuffer();
    }

    async getAssetImage(path, noPrefix=false) {
        if(!noPrefix) path = this.getAssetPath(path);
        if(this.imgCache[path]) return this.imgCache[path];
        if(!this.readCache[path]) throw new Error("Undefined asset");

        const data = this.readCache[path];
        const uint = new Uint8Array(data);

        let img;
        if(uint[1] === 1) {
            img = await this._loadTGA(data);
        } else {
            img = await this._loadPNG(data);
        }

        this.imgCache[path] = img;
        return img;
    }

    async listDirectory(path) {
        const resp = await fetch(path);
        const html = await resp.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const links = Array.from(doc.getElementsByTagName("a"));
        const content = [];

        for(let i in links) {
            const name = links[i].innerText;

            let type = "file";
            if(name.endsWith("/")) type = "dir";
            content.push({name: name, type: type});
        }

        return content;
    }

    getEvalAdditionalData() {
        return `//# sourceURL=${location.href.substring(0, location.href.length-1)}${this.path_script};`
    }

    setupHTMLEvents(block) {
        block.onmousedown = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            this.handleEvent("onmousedown", x, y, {x, y});
        };

        block.onmouseup = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            this.handleEvent("onmouseup", x, y, {x, y});
        };

        block.oncontextmenu = (e) => {
            const [x, y] = this._fetchCoordinates(e);
            console.log("click coords", x, y);
        }
    }

    newCanvas() {
        return document.createElement("canvas");
    }

    _fetchCoordinates(e) {
        const rect = e.target.getBoundingClientRect()
        let x, y;

        switch(this.rotation) {
            case 90:
                x = e.clientY - rect.top;
                y = rect.width - (e.clientX - rect.left);
                break;
            case 180:
                x = rect.width - (e.clientX - rect.left);
                y = rect.height - (e.clientY - rect.top);
                break;
            case 270:
                x = rect.height - (e.clientY - rect.top);
                y = e.clientX - rect.left;
                break;
            default:
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
        }
        
        return [Math.floor(x), Math.floor(y)];
    }

    _loadPNG(data) {
        return new Promise((resolve, reject) => {
            const blob = new Blob( [ data ] );
            const url = URL.createObjectURL( blob );
            const img = document.createElement("img");
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = url;
        });
    }

    /**
     * Load TGA image
     * 
     * @param {ArrayBuffer} data URL or path
     * @returns image
     */
     async _loadTGA(data) {
        if(!this.__tga_first_use) {
            this.onConsole("ZeppPlayer", [
                "We're using TGA images loader. This will reduce performance."
            ]);
            this.__tga_first_use = true;
        }

        const tga = TGAImage.imageWithData(data);
        await tga.didLoad;

        if(tga._colorMapType !== 1 || tga._colorMapDepth !== 32) {
            this.onConsole("SystemWarning", [`TGA file ${url.substring(url.lastIndexOf("/") + 1)} has ` +
                `invalid colormap depth, ${tga._colorMapDepth} != 32. This `+
                `file won't be accepted by ZeppOS.`]);
        }

        return tga.image;
    }
}
