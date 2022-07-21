import { ConsoleManager } from "./ui_managment/ConsoleManager.js";
import { EditorManager } from "./ui_managment/EditorManager.js";
import ExplorerManager from "./ui_managment/ExplorerManager.js";
import { ProjectPicker } from "./ui_managment/ProjectPicker.js";
import { ToolbarManager } from "./ui_managment/ToolbarManager.js";
import { initVersionUI } from "./ui_managment/Updater.js";
import { ChromeZeppPlayer } from "./zepp_player/ChromeZeppPlayer.js";
import { PersistentStorage } from "./zepp_player/PersistentStorage.js";

const DISPLAY_FPS = 25;

const DISPLAY_DELTA = 1000 / DISPLAY_FPS;

/**
 * Start all
 */
const start = async () => {
    const root = document.getElementById("display");
    const ctx = root.getContext("2d");

    const player = new ChromeZeppPlayer();
    player.system_fps = DISPLAY_FPS;

    initVersionUI();

    ToolbarManager.init(player);
    EditorManager.init(player);
    ConsoleManager.init(player);
    ExplorerManager.init(player);

    // Make storage available from browser console
    window.PersistentStorage = PersistentStorage;
    window.player = player;

    // Project picker
    const picker = new ProjectPicker(player);
    await picker.loadProjects();

    // Load main script
    const proj = picker.getProject();
    await player.setProject(proj);
    await player.init();

    // Prepare canvas
    root.width = player.screen[0];
    root.height = player.screen[1];
    player.setupHTMLEvents(root);

    // Render in cycle
    const refresh = async () => {
        if(Date.now() - lastRefresh >= DISPLAY_DELTA) {
            await performRefresh();
        }
        requestAnimationFrame(refresh);
    };
    
    const performRefresh = async () => {
        if(document.hidden || player.uiPause || !player.refresh_required) return;

        let canvas;
        try {
            canvas = await player.render();
        } catch(e) {
            console.error("Render err", e);
            canvas = await player.getAssetImage("app/render_fail.png", true);
            player.refresh_required = false;
        }
        const rotation = player.rotation;

        let [w, h] = [canvas.width, canvas.height];
        if(rotation % 180 == 90) [h, w] = [w, h];
        if(root.width != w) root.width = w;
        if(root.height != h) root.height = h;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
        ctx.restore();
    }

        refresh();
};

start();
