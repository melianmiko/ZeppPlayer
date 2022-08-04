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
import {TGAImage} from "./TgaImage";

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

        block.onmousemove = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            this.handleEvent("onmousemove", x, y, {x, y});
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
}
