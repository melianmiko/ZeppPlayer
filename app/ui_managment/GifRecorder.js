import { ToolbarManager } from "./ToolbarManager.js";

export default class GifRecorder {
    loading = document.getElementById("loading");

    constructor(player) {
        this.player = player;
    }

    async record() {
        const FPS = 15;
        const SECONDS = 4;

        // Lock screen
        this.loading.style.display = "";

        // Force set uiPause to prevent auto-render
        this.player.uiPause = true;
        this.player.withShift = false;
        this.player.showEventZones = false;
        this.player.render_counter = 0;
        this.player.current_level = 1;

        // Create
        const gif = new GIF({
            width: this.player.screen[0],
            height: this.player.screen[1],
            workerScript: "/lib/gif.worker.js"
        });

        // Render
        this.player.wipeSettings();
        await this.player.init();
        for(let i = 0; i < FPS*SECONDS*2; i++) {
            if(i == FPS*SECONDS) this.player.current_level = 2;

            const canvas = await this.player.render();
            gif.addFrame(canvas, {delay: Math.round(1000 / FPS)});

            this.player.performShift();
        }

        // Render
        const blob = await this._renderGif(gif);
        this.loading.style.display = "none";

        this.blob = blob;

        this.player.current_level = 1;
        this.player.uiPause = false;
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
        const url = URL.createObjectURL(this.blob);
        const img = new Image();
        img.src = url;

        const view = document.getElementById("files_view");
        const caption = document.createElement("caption");
        caption.innerText = 'Right-click on GIF and select "Save image as..."';

        view.innerHTML = "";
        view.appendChild(caption);
        view.appendChild(img);
    }
}