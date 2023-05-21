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

import { ToolbarManager } from "./ToolbarManager.js";
import { saveAs } from "file-saver";

export default class GifRecorder {
    loading = document.getElementById("loading");

    constructor(player) {
        this.player = player;
    }

    async record() {
        const FPS = 5;
        const SECONDS = 4;

        // Lock screen
        this.loading.style.display = "";

        // Force set uiPause to prevent auto-render
        this.player.config.withAutoIncrement = false;
        this.player.config.showEventZones = false;
        this.player.wipeSettings();
        await this.player.setRenderLevel(1);
        await this.player.init();

        this.player.currentRuntime.animMaxFPS = true;
        this.player.currentRuntime.uiPause = true;

        // Create
        const gif = new GIF({
            width: this.player.screen[0],
            height: this.player.screen[1],
            workerScript: "/app/lib/gif.worker.js"
        });

        // Render
        for(let i = 0; i < FPS * SECONDS * 2; i++) {
            if(i === FPS*SECONDS) await this.player.setRenderLevel(2);

            const canvas = await this.player.render(true);
            gif.addFrame(canvas, {delay: Math.round(1000 / FPS)});

            this.player.performShift(i);
            this.player.currentRuntime.callDelegates("resume_call");
        }

        // Render
        const blob = await this._renderGif(gif);
        this.loading.style.display = "none";

        this.blob = blob;

        await this.player.setRenderLevel(1);
        this.player.currentRuntime.animMaxFPS = false;
        this.player.currentRuntime.uiPause = false;
        ToolbarManager._refresh();
    }

    _renderGif(gif) {
        return new Promise((resolve, reject) => {
            gif.on('finished', function(blob) {
                resolve(blob);
            });
            gif.render();
        })
    }

    export() {
        const projectSelect = document.getElementById("project_select");
        const project = projectSelect.value;
        saveAs(this.blob, project + ".gif");
    }
}