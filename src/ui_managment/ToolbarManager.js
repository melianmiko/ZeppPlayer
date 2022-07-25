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

import { PersistentStorage } from "../zepp_player/PersistentStorage.js";
import GifRecorder from "./GifRecorder.js";

export class ToolbarManager {
    static player = null;

    // UI Elements
    static toggleMode1 = document.getElementById("mode_1");
    static toggleMode2 = document.getElementById("mode_2");
    static toggleMode4 = document.getElementById("mode_4");
    static toggleEventZones = document.getElementById("toggle_events");
    static togglePause = document.getElementById("toggle_pause");
    static toggleShift = document.getElementById("toggle_shift");
    static toggleConsole = document.getElementById("toggle_console");
    static toggleEditor = document.getElementById("toggle_edit");
    static toggleExplorer = document.getElementById("toggle_explorer");
    static toggleFrames = document.getElementById("toggle_overlay");
    
    static doReloadBtn = document.getElementById("do_reload");
    static doExportBtn = document.getElementById("do_export");
    static doGifBtn = document.getElementById("do_gif");
    static doRotateBtn = document.getElementById("do_rotate");

    static viewConsole = document.getElementById("view_console");
    static viewEditor = document.getElementById("view_edit");
    static viewExplorer = document.getElementById("view_explorer");

    static init(player) {
        ToolbarManager.player = player;

        // Load saved settings
        if(localStorage.zepp_player_editor === "true") {
            ToolbarManager.viewEditor.style.display = "";
        }
        if(localStorage.zepp_player_console === "true") {
            ToolbarManager.viewConsole.style.display = "";
        }
        if(localStorage.zepp_player_explorer === "true") {
            ToolbarManager.viewExplorer.style.display = "";
        }
        if(localStorage.zepp_player_rotation !== undefined) {
            ToolbarManager.player.rotation = parseInt(localStorage.zepp_player_rotation);
        }
        ToolbarManager._refresh();

        // Bind onClick events
        ToolbarManager.toggleMode1.onclick = () => ToolbarManager.doToggleMode(1);
        ToolbarManager.toggleMode2.onclick = () => ToolbarManager.doToggleMode(2);
        ToolbarManager.toggleMode4.onclick = () => ToolbarManager.doToggleMode(4);
        ToolbarManager.toggleEventZones.onclick = ToolbarManager.doToggleEventZones;
        ToolbarManager.togglePause.onclick = ToolbarManager.doTogglePause;
        ToolbarManager.doExportBtn.onclick = ToolbarManager.doExport;
        ToolbarManager.toggleShift.onclick = ToolbarManager.doToggleShift;
        ToolbarManager.doReloadBtn.onclick = ToolbarManager.doReload;
        ToolbarManager.toggleConsole.onclick = ToolbarManager.doToggleConsole;
        ToolbarManager.toggleEditor.onclick = ToolbarManager.doToggleEdit;
        ToolbarManager.toggleExplorer.onclick = ToolbarManager.DoToggleExplorer;
        ToolbarManager.doGifBtn.onclick = ToolbarManager.doGif;
        ToolbarManager.doRotateBtn.onclick = ToolbarManager.doRotate;
        ToolbarManager.toggleFrames.onclick = ToolbarManager.doToggleFrames;

        document.addEventListener("keypress", ToolbarManager.handleKeypress);
    }

    static handleKeypress(e) {
        switch(e.key) {
            case "1":
                ToolbarManager.doToggleMode(1);
                return;
            case "2":
                ToolbarManager.doToggleMode(2);
                return;
            case "3":
                ToolbarManager.doToggleMode(4);
                return;
            case "P":
                ToolbarManager.doTogglePause();
                return;
            case "S":
                ToolbarManager.doToggleShift();
                return;
            case "Z":
                ToolbarManager.doToggleEventZones();
                return;
            case "W":
                ToolbarManager.doReload();
                return;
            case "D":
                ToolbarManager.doExport();
                return;
            case "c":
                ToolbarManager.doToggleConsole();
                return;
            case "e":
                ToolbarManager.doToggleEdit();
                return;
        }
    }

    /**
     * Update buttons active/inactive states
     */
    static _refresh() {
        const data = [
            [ToolbarManager.toggleEditor, localStorage.zepp_player_editor === "true"],
            [ToolbarManager.toggleConsole, localStorage.zepp_player_console === "true"],
            [ToolbarManager.toggleExplorer, localStorage.zepp_player_explorer === "true"],
            [ToolbarManager.toggleEventZones, ToolbarManager.player.showEventZones],
            [ToolbarManager.togglePause, ToolbarManager.player.uiPause],
            [ToolbarManager.toggleShift, ToolbarManager.player.withShift],
            [ToolbarManager.toggleFrames, ToolbarManager.player.render_overlay],
            [ToolbarManager.toggleMode1, ToolbarManager.player.current_level == 1],
            [ToolbarManager.toggleMode2, ToolbarManager.player.current_level == 2],
            [ToolbarManager.toggleMode4, ToolbarManager.player.current_level == 4]
        ];

        for(let i in data) {
            const [button, enabled] = data[i];
            enabled ? button.classList.add("active") : button.classList.remove("active");
        }
    }

    static doRotate() {
        ToolbarManager.player.rotation = (ToolbarManager.player.rotation + 90) % 360;
        localStorage.zepp_player_rotation = ToolbarManager.player.rotation;
        ToolbarManager.player.refresh_required = "ui";
    }

    static doToggleMode(val) {
        const player = ToolbarManager.player;
        player.current_level = val;
        ToolbarManager._refresh();
    }

    static doToggleFrames() {
        ToolbarManager.player.render_overlay = !ToolbarManager.player.render_overlay;
        ToolbarManager._refresh();
        ToolbarManager.player.refresh_required = "ui";
    }

    static doTogglePause() {
        const player = ToolbarManager.player;
        player.setPause(!player.uiPause);
        ToolbarManager._refresh();
    }
    
    static doToggleEventZones() {
        const player = ToolbarManager.player;
        player.showEventZones = !player.showEventZones;
        ToolbarManager._refresh();
    }

    static doExport() {
        const player = ToolbarManager.player;
        const out = player.exportAll();
        console.info(out);
    }

    static doToggleShift() {
        const player = ToolbarManager.player;
        player.withShift = !player.withShift;
        ToolbarManager._refresh();
    }

    static doReload() {
        PersistentStorage.wipe();

        const player = ToolbarManager.player;
        player.init();
    }

    static doToggleConsole() {
        const newState = localStorage.zepp_player_console !== "true";
        ToolbarManager.viewConsole.style.display = newState ? "" : "none";
        localStorage.zepp_player_console = newState;
        ToolbarManager._refresh();
    }

    static doToggleEdit() {
        const newState = localStorage.zepp_player_editor !== "true";
        ToolbarManager.viewEditor.style.display = newState ? "" : "none";
        localStorage.zepp_player_editor = newState;
        ToolbarManager._refresh();
    }

    static DoToggleExplorer() {
        const newState = localStorage.zepp_player_explorer !== "true";
        ToolbarManager.viewExplorer.style.display = newState ? "" : "none";
        localStorage.zepp_player_explorer = newState;
        ToolbarManager._refresh();
    }

    static async doGif() {
        const gifRecorder = new GifRecorder(ToolbarManager.player);
        await gifRecorder.record();
        gifRecorder.export();
    }
}
