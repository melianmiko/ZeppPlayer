import { ConsoleManager } from "./ui_managment/ConsoleManager.js";
import { EditorManager } from "./ui_managment/EditorManager.js";
import { ProjectPicker } from "./ui_managment/ProjectPicker.js";
import { ToolbarManager } from "./ui_managment/ToolbarManager.js";
import { initVersionUI } from "./ui_managment/Updater.js";
import { ChromeZeppPlayer } from "./zepp_player/ChromeZeppPlayer.js";
import { PersistentStorage } from "./zepp_player/PersistentStorage.js";

/**
 * Start all
 */
const start = async () => {
    const root = document.getElementById("display");
    const player = new ChromeZeppPlayer();

    initVersionUI();

    ToolbarManager.init(player);
    EditorManager.init(player);
    ConsoleManager.init(player);

    // Make storage available from browser console
    window.PersistentStorage = PersistentStorage;

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
    const ctx = root.getContext("2d");
    const overlay = await player.getAssetImage("../../../app/overlay.png");
    const refresh = async () => {
        if(!document.hidden && !player.uiPause) {
            const canvas = await player.render();
            const rotation = player.rotation;

            let [w, h] = [canvas.width, canvas.height];
            if(rotation % 180 == 90) [h, w] = [w, h];
            if(root.width != w) root.width = w;
            if(root.height != h) root.height = h;

            ctx.save();
            ctx.translate(w / 2, h / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
            if(ToolbarManager.withOverlay) 
                ctx.drawImage(overlay, -canvas.width / 2, -canvas.height / 2);
            ctx.restore();
        } 
        window.requestAnimationFrame(refresh);
    };
    refresh();
};

start();
