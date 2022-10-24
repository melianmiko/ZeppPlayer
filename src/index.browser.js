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

import { ConsoleManager } from "./ui_managment/ConsoleManager.js";
import { EditorManager } from "./ui_managment/EditorManager.js";
import ExplorerManager from "./ui_managment/ExplorerManager.js";
import { ProjectPicker } from "./ui_managment/ProjectPicker.js";
import { ToolbarManager } from "./ui_managment/ToolbarManager.js";
import { initVersionUI } from "./ui_managment/Updater.js";
import { ChromeZeppPlayer } from "./zepp_player/ChromeZeppPlayer.js";
import { PersistentStorage } from "./zepp_player/PersistentStorage.js";
import {initCssSettings} from "./ui_managment/CssSettingsManager";

// const DISPLAY_FPS = 25;

// const DISPLAY_DELTA = 1000 / DISPLAY_FPS;

/**
 * Start all
 */
const start = async () => {
    const root = document.getElementById("display");
    const ctx = root.getContext("2d");

    // Preload font
    const font = new FontFace("allfont", "url(/app/allfont-Medium.ttf)");
    await font.load();
    document.fonts.add(font);

    const player = new ChromeZeppPlayer();
    // player.system_fps = DISPLAY_FPS;

    // Make storage available from browser console
    window.PersistentStorage = PersistentStorage;
    window.player = player;

    // Project picker
    const picker = new ProjectPicker(player);
    await picker.loadProjects();

    // Load main script
    const proj = picker.getProject();
    await player.setProject(proj);

    ToolbarManager.init(player);
    EditorManager.init(player);
    ConsoleManager.init(player);
    ExplorerManager.init(player);
    initCssSettings();

    await player.init();

    // Prepare canvas
    root.width = player.screen[0];
    root.height = player.screen[1];
    player.setupHTMLEvents(root);

    // Render in cycle
    let lastRefresh = 0;

    const refresh = async () => {
        await performRefresh();
        requestAnimationFrame(refresh);
    };
    
    const performRefresh = async () => {
        if(!player.currentRuntime) return;
        if(document.hidden || player.currentRuntime.uiPause || !player.currentRuntime.refresh_required) return;

        let canvas;
        try {
            canvas = await player.render();
        } catch(e) {
            console.error("Render err", e);
            canvas = await player.getAssetImage("render_fail.png", true);
            player.refresh_required = false;
        }
        const rotation = player.rotation;

        let [w, h] = [canvas.width, canvas.height];
        if(rotation % 180 === 90) [h, w] = [w, h];
        if(root.width !== w) root.width = w;
        if(root.height !== h) root.height = h;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();
    }

        refresh();
};

initVersionUI();
start();
