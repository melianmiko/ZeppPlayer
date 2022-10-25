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
        this.uiOverlayVisible = false;
        this.uiOverlayPosition = [0, 0];
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
        let isMouseDown = false;

        document.documentElement.onkeydown = (e) => {
            if(e.key === "Shift") {
                this.uiOverlayVisible = true;
                this.currentRuntime.refresh_required = "uiOverlay";
            }
        }

        document.documentElement.onkeyup = (e) => {
            if(e.key === "Shift") {
                this.uiOverlayVisible = false;
                this.currentRuntime.refresh_required = "uiOverlay";
            }
        }

        block.onmousedown = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            isMouseDown = true;
            this.handleEvent("onmousedown", x, y, {x, y});
        };

        block.onmouseup = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            isMouseDown = false;
            this.handleEvent("onmouseup", x, y, {x, y});
        };

        block.onmouseout = () => {
            isMouseDown = false;
        }

        block.onmousemove = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            if(isMouseDown)
                this.handleEvent("onmousemove", x, y, {x, y});

            if(this.uiOverlayVisible) {
                const rect = e.target.getBoundingClientRect();
                const uiX = e.clientX - rect.left;
                const uiY = e.clientY - rect.top;

                this.uiOverlayPosition = [uiX, uiY];
                this.currentRuntime.refresh_required = "uiOverlay";
            }
        };

        block.oncontextmenu = (e) => {
            const [x, y] = this._fetchCoordinates(e);
            console.log("click coords", x, y);
        };
    }

    async render() {
        const canvas = await super.render(...arguments);

        if(this.uiOverlayVisible) {
            const [x, y] = this.uiOverlayPosition;
            const context = canvas.getContext("2d");
            const baseColor = this.getDeviceState("OVERLAY_COLOR");

            context.save();
            context.lineWidth = 1;

            // Baselines
            context.strokeStyle = baseColor;
            context.globalAlpha = 0.4;
            context.beginPath();
            context.setLineDash([]);
            context.moveTo(Math.floor(canvas.width / 2), 0);
            context.lineTo(Math.floor(canvas.width / 2), canvas.height);
            context.moveTo(0, Math.floor(canvas.height / 2));
            context.lineTo(canvas.width, Math.floor(canvas.height / 2));
            context.stroke();

            // Current widget
            context.strokeStyle = baseColor;
            context.globalAlpha = 1;
            for(const widget of this.currentRuntime.widgets) {
                if(!widget.positionInfo) continue;
                const [x1, y1, x2, y2] = widget.positionInfo;
                if(x > x1 && x < x2 && y > y1 && y < y2) {
                    context.beginPath();
                    context.rect(x1, y1, x2 - x1, y2 - y1);
                    context.stroke();
                }
            }

            // Current event trigger
            context.strokeStyle = "#0099FF";
            for(let data of this.currentRuntime.events) {
                let hasNoNull = false;
                for(let i in data.events) {
                    if(data.events[i] !== null) {
                        hasNoNull = true;
                        break;
                    }
                }

                if(!hasNoNull) continue;

                const {x1, y1, x2, y2} = data;
                if(x > x1 && x < x2 && y > y1 && y < y2) {
                    context.beginPath();
                    context.rect(x1, y1, x2 - x1, y2 - y1);
                    context.stroke();
                    break;
                }
            }

            // Cursor alignment lines
            context.strokeStyle = baseColor;
            context.globalAlpha = 1;
            context.beginPath();
            context.setLineDash([10, 2]);
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.stroke();

            // Cursor coordinates
            context.font = "12px monospace";
            context.fillStyle = baseColor;
            const text = `${x}, ${y}`
            const metrics = context.measureText(text);
            const tx = x > canvas.width / 2 ? x - metrics.width - 2 : x + 2;
            const ty = y > canvas.height / 2 ? y - 4 : y + 14;
            context.fillText(text,tx, ty);

            context.restore();
        }

        return canvas;
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
