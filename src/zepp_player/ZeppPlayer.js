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

import {createDeviceState} from "./DeviceStateObject.js";
import {PersistentStorage} from "./PersistentStorage.js";
import ZeppPlayerConfig from "./ZeppPlayerConfig.js";
import Overlay from "./ui/Overlay.js";
import ZeppRuntime from "./ZeppRuntime.js";
import {TGAImage} from "./TgaImage";
import {createAppEnv} from "./SyystemEnvironment";

export default class ZeppPlayer extends ZeppPlayerConfig {
    LEVEL_NORMAL = 1;
    LEVEL_AOD = 2;
    LEVEL_EDIT = 4;

    _lastCanvas = null;
    zeppEnv = null;

    withStagingDump = false;
    stages = [];
    vfs = {};

    constructor() {
        super();

        // Device config
        this.screen = [192, 490];
        this.path_script = "";
        this.path_project = "";
        this.appEnv = null;

        // Render stage data
        this.render_counter = 0;

        // Script data
        this.currentRuntime = null;
        this.wfBaseRuntime = null;
        this.wfSubRuntime = null;
        this.backStack = [];
        this.globalScopeFix = [];
        this.initTime = 0;
        this.appType = "";

        // Device state
        this._deviceState = createDeviceState();
        this._deviceStateChangeEvents = {};

        // Events
        this.onConsole = (_, __) => null;
        this.onRestart = () => null;
    }

    async getAssetImage(path, noPrefix=false) {
        if(!noPrefix) path = this.getAssetPath(path);
        if(this.imgCache[path]) return this.imgCache[path];
        if(!this.vfs[path]) throw new Error("Undefined asset: " + path);

        const data = this.vfs[path];
        const uint = new Uint8Array(data);

        let img;
        if(uint[0] === 137 && uint[1] === 80) {
            img = await this._loadPNG(data);
        } else {
            img = await this._loadTGA(data);
        }

        this.imgCache[path] = img;
        return img;
    }

    async _loadTGA(data) {
        if(!this.__tga_first_use) {
            this.onConsole("ZeppPlayer", [
                "We're using TGA images loader. This will reduce performance."
            ]);
            this.__tga_first_use = true;
        }

        const tga = TGAImage.imageWithData(data);
        await tga.didLoad;

        const id = (new TextDecoder()).decode(tga._imageID.slice(0, 4));
        if(id !== "SOMH") this.onConsole("SystemWarning", [
            "Some file(s) aren't ZeppOS-compatible TGA. This may not work on real device."
        ]);

        return tga.canvas;
    }

    wipeSettings() {
        this._deviceState = createDeviceState();
        PersistentStorage.wipe();
    }

    setPause(val) {
        this.currentRuntime.callDelegates(val ? "pause_call" : "resume_call");
        this.currentRuntime.uiPause = val;
    }

    handleScriptError(e) {
        if(e.message.endsWith("is not defined")) {
            const name = e.message.split(" ")[0];
            if(this.globalScopeFix.indexOf(name) < 0) {
                console.log("%cAuto-fix global define of " + name, 'color: #8cf')
                this.globalScopeFix.push(name);
                this.mustRestart = true;
            }
        }
    }

    getVfsAppPath() {
        const pkg = this.appConfig.app;
        const idn = pkg.appId.toString(16).padStart(8, "0").toUpperCase();
        return '/storage/js_' + pkg.appType + "s/" + idn;
    }

    getAssetPath(path) {
        return this.getVfsAppPath() + "/assets/" + path;
    }

    getDeviceState(type, dataType="null") {
        const v = this._deviceState[type];
        switch(dataType) {
            case "progress":
                return v.getProgress(v);
            case "string":
                return v.getString(v);
            case "maxLength":
                return v.maxLength;
            case "boolean":
                return v.getBoolean(v);
            default:
                return v.value;
        }
    }

    addDeviceStateChangeEvent(type, callback) {
        if(!this._deviceStateChangeEvents[type]) 
            this._deviceStateChangeEvents[type] = [];
        this._deviceStateChangeEvents[type].push(callback);
    }

    setDeviceState(type, value) {
        this._deviceState[type].value = value;
        if(this._deviceStateChangeEvents[type]) {
            for(let i in this._deviceStateChangeEvents[type]) {
                this._deviceStateChangeEvents[type][i]()
            }
        }

        this.currentRuntime.refresh_required = "set_state";
    }

    async setProject(path) {
        const jsonFile = await this.loadFile(path + '/app.json');
        const jsonText = new TextDecoder().decode(jsonFile);
        const appConfig = JSON.parse(jsonText);
        this.appConfig = appConfig;
        this.path_project = path;

        // Try to execute app.js
        const appJsFile = await this.loadFile(path + '/app.js');
        const appJsText = new TextDecoder().decode(appJsFile);
        const appEnv = createAppEnv(this);

        try {
            const str = `(${Object.keys(appEnv).toString() }) => {${appJsText};}`;
            const appJs = eval(str);
            appJs(...Object.values(appEnv));
        } catch (e) {
            console.warn("app.js exec failed", e);
        }

        this.appEnv = appEnv;

        // Find init page
        let modulePath = null;
        if(appConfig.app.appType === "watchface") {
            // Run as watchface
            modulePath = "watchface/index";
            if(appConfig.module && appConfig.module.watchface)
                modulePath = appConfig.module.watchface.path;
        } else if(appConfig.app.appType === "app") {
            // Run as app (experimental)
            modulePath = appConfig.module.page.pages[0];
        }

        // Preload content
        this.onConsole("ZeppPlayer", ['Preloading assets, please be patient...']);
        await this.preloadProjectAssets(path + "/");
        // this.onConsole("ZeppPlayer", ['Assets loaded.']);

        this.appType = appConfig.app.appType;
        this.setPage(modulePath);
    }

    async readDirectoryRecursive(path, arr=null) {
        if(!arr) arr = [];

        const dirContent = await this.listDirectory(path);
        for(let i in dirContent) {
            const filePath = path + dirContent[i].name;
            if(dirContent[i].type === "file") {
                arr.push(filePath);
            } else {
                await this.readDirectoryRecursive(filePath, arr);
            }
        }

        return arr;
    }

    async preloadProjectAssets(path) {
        const urls = await this.readDirectoryRecursive(path);
        const contents = await Promise.all(urls.map(this.loadFile));
        const vfsRoot = this.getVfsAppPath();

        for(let i = 0; i < urls.length; i++) {
            const vfsPath = urls[i].replace(this.path_project, vfsRoot);
            this.vfs[vfsPath] = contents[i];
        }

        this.vfs["player_overlay.png"] = await this.loadFile("/app/overlay.png");
        this.vfs["render_fail.png"] = await this.loadFile("/app/render_fail.png");
    }

    setPage(modulePath) {
        this.path_script = this.path_project + "/" + modulePath + ".js";
        console.info("Continue with page", this.path_script);
    }

    async enterPage(url, param) {
        this.currentRuntime.uiPause = true;
        this.currentRuntime.callDelegates("pause_call");
        this.backStack.push(this.currentRuntime);

        // New runtime
        this.setPage(url);
        const runtime = new ZeppRuntime(this, this.path_script, 1);
        runtime.onInitParam = param;
        await runtime.start();
        runtime.refresh_required = 'init';

        this.currentRuntime = runtime;
        this.renderScroll = 0;
        this._lastCanvas = null;
    }

    async back() {
        if(this.backStack.length < 1) return;

        // Finish current
        this.currentRuntime.callDelegates("pause_call");
        this.currentRuntime.uiPause = true;
        this.currentRuntime.destroy();

        // Get prev
        const runtime = this.backStack.pop();
        runtime.uiPause = false;
        runtime.callDelegates("resume_call");
        runtime.refresh_required = "back";

        this.path_script = runtime.scriptPath;
        this.currentRuntime = runtime;
        this._lastCanvas = null;
    }

    async finish() {
        if(!this.wfBaseRuntime) return;

        this.wfBaseRuntime.destroy();
        this.wfBaseRuntime = null;
        this.render_counter = 0;
        this._deviceStateChangeEvents = {};
        this.mustRestart = false;
        this.onDestroy = [];
        this.backStack = [];
    }

    getEvalAdditionalData() {
        return '';
    }

    async init() {
        await this.finish();
        await this.onRestart();

        this.mustRestart = false;

        const runtime = new ZeppRuntime(this, this.path_script, 1);
        this.wfBaseRuntime = runtime;

        let error = null;
        try {
            await runtime.start();
            this.currentRuntime = runtime;
        } catch(e) {
            error = e;
            this.handleScriptError(e);
        }

        if(this.mustRestart) {
            this.onConsole("ZeppPlayer", ["Auto-fix applied, restarting..."])
            await this.init();
            return;
        } else if(error !== null) {
            console.error(error);
            this.onConsole("ZeppPlayer", ["Init failed"]);
        }

        if(this._currentRenderLevel !== 1) {
            const val = this._currentRenderLevel;
            this._currentRenderLevel = 1;
            await this.setRenderLevel(val);
        }
    }

    handleEvent(name, x, y, info) {
        let events = this.currentRuntime.events[name];
        y += this.renderScroll;

        if(!events) return;
        if(events.length === 0) return;

        for(let i = events.length-1; i >= 0; i--) {
            const zone = events[i];
            if(zone.x1 < x && x < zone.x2 && zone.y1 < y && y < zone.y2) {
                zone.fn(info);
                return;
            }
        }
    }

    async setRenderLevel(val) {
        if(this.appType !== "watchface") return;
        if(val === this.current_level) return;

        const currentVal = this._currentRenderLevel;

        if(this.wfSubRuntime) {
            // Destroy sub runtime
            this.wfSubRuntime.destroy();
            this.wfSubRuntime = null;
        }

        if(val !== 1) {
            // Prepare sub-runtime
            this.wfSubRuntime = new ZeppRuntime(this, this.path_script, val);
            await this.wfSubRuntime.start();
        }

        if(val === 1 && currentVal !== 4) {
            this.wfBaseRuntime.callDelegates("resume_call");
            this.wfBaseRuntime.uiPause = false;
        } else if(currentVal === 1) {
            this.wfBaseRuntime.callDelegates("pause_call");
            this.wfBaseRuntime.uiPause = true;
        }

        this._currentRenderLevel = val;
        this.currentRuntime = val === 1 ? this.wfBaseRuntime : this.wfSubRuntime;
        this.currentRuntime.refresh_required = true;

        if(currentVal === 4)
            await this.init();
    }

    /**
     * Render current stage.
     * @returns a new canvas
     */
    async render(force=false) {
        let runtime = this.currentRuntime;

        if(!runtime.refresh_required && this._lastCanvas && !force)
            return this._lastCanvas;

        let canvas = this.newCanvas();
        let ctx = canvas.getContext("2d");

        canvas.width = this.screen[0];
        canvas.height = this.screen[1] + this.renderScroll;

        // Fill with black
        if(this.withoutTransparency) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Prepare props
        this.stages = [];
        runtime.onRenderBegin();

        // Render all widgets
        const stages = {
            normal: [],
            post: [],
            toplevel: []
        }

        for(let i in runtime.widgets) {
            const widget = runtime.widgets[i];
            if(!widget) continue;
            const stage = widget._renderStage ? widget._renderStage : "normal";
            stages[stage].push(widget);
        }

        for(let stage in stages) {
            for(let i in stages[stage]) {
                const widget = stages[stage][i];
                if(!widget) continue;

                await runtime.renderWidget(widget, canvas);
            }
        }

        // Frames
        if(this.showEventZones) {
            ctx.strokeStyle = "rgba(0, 153, 255, 0.5)";
            ctx.lineWidth = 2;
            for(let name in runtime.events) {
                for(let i in runtime.events[name]) {
                    const {x1, y1, x2, y2} = runtime.events[name][i];
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                }
            }
        }

        // Shifts
        if(this.withShift) {
            if(this.render_counter % 15 === 0) 
                this.performShift();
            runtime.refresh_required = "shift";
        }

        if(this.renderScroll !== 0) {
            const newCanvas = this.newCanvas();
            newCanvas.width = canvas.width;
            newCanvas.height = this.screen[1];
            newCanvas.getContext("2d").drawImage(canvas, 0, -this.renderScroll);
            canvas = newCanvas;
        }

        // Overlay
        if(this.render_overlay) {
            await Overlay.draw(this, canvas);
        }

        this.render_counter = (this.render_counter + 1) % 3000;
        this._lastCanvas = canvas;

        return canvas;
    }

    performShift() {
        for(let i in this._deviceState) {
            if(this._deviceState[i].shift) {
                const v = this._deviceState[i].shift(this.render_counter, this._deviceState[i]);
                if(v !== null) this.setDeviceState(i, v);
            }
        }
    }

    async listDirectory(path) {}

    async loadFile() {}

    newCanvas() {
        throw new Error("not overriden");
    }
}
