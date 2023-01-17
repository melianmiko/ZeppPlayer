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
import {DeviceProfiles} from "./DeviceProfiles";

export default class ZeppPlayer extends ZeppPlayerConfig {
    constructor() {
        super();

        this._lastCanvas = null;
        this.profileName = "sb7";
        this.projectPath = "";
        this.appEnv = null;
        this.render_counter = 0;
        this.currentRuntime = null;
        this.wfBaseRuntime = null;
        this.wfSubRuntime = null;
        this.backStack = [];
        this.globalScopeFix = [];

        // Device state
        this._deviceState = createDeviceState();
        this._deviceStateChangeEvents = {};
    }

    /**
     * Overridable onConsole event
     */
    onConsole() {}

    /**
     * Overridable onRestart ev
     */
    onRestart() {}

    get profileData() {
        return DeviceProfiles[this.profileName];
    }

    get screen() {
        return [this.profileData.screenWidth, this.profileData.screenHeight];
    }

    get appType() {
        return this.appConfig.app.appType;
    }

    /**
     * Get asset image from app-relative path
     * @param path image path
     * @returns {Promise<HTMLCanvasElement|*>} Target image canvas
     */
    async getAssetImage(path) {
        path = this.getVfsAssetPath(path);
        if(this.imgCache[path]) return this.imgCache[path];
        if(!this.vfs[path]) throw new Error("Undefined asset: " + path);

        const data = this.vfs[path];
        const uint = new Uint8Array(data);

        let img;
        if(uint[0] === 137 && uint[1] === 80) {
            img = await this._loadPNG(data);
        } else {
            const tga = new TGAImage(data, this.profileData);
            await tga.didLoad;

            img = tga.canvas;
        }

        this.imgCache[path] = img;
        return img;
    }

    /**
     * Reset emulated system settings.
     */
    wipeSettings() {
        this._deviceState = createDeviceState();
        PersistentStorage.wipe();
    }

    /**
     * Parse error message and try to fix global undefined vars
     * @param e Error obj
     */
    autoFixGlobalScopeError(e) {
        if(e.message.endsWith("is not defined")) {
            const name = e.message.split(" ")[0];
            if(this.globalScopeFix.indexOf(name) < 0) {
                console.log("%cAuto-fix global define of " + name, 'color: #8cf')
                this.globalScopeFix.push(name);
                return true;
            }
        }

        return false;
    }

    getVfsAppPath() {
        const pkg = this.appConfig.app;
        const idn = pkg.appId.toString(16).padStart(8, "0").toUpperCase();
        return '/storage/js_' + pkg.appType + "s/" + idn;
    }

    getVfsAssetPath(path) {
        return this.getVfsAppPath() + "/assets/" + path;
    }

    getDeviceState(type, dataType="null") {
        const v = this._deviceState[type];
        switch(dataType) {
            case "progress":
                return Math.min(1, v.getProgress(v));
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

        if(this.currentRuntime)
            this.currentRuntime.refresh_required = "set_state";
    }

    async setProject(path) {
        this.projectPath = path;
        this.overlayTool = new Overlay(this);
        this.vfs = {};

        await this._loadAppConfig();
        await this._loadAppJs();
        await this.overlayTool.init();
        await this.preloadProjectAssets(path + "/");
    }

    /**
     * Read and execute app.js form current project
     * @returns {Promise<void>}
     * @private
     */
    async _loadAppJs() {
        const appJsFile = await this.loadFile(this.projectPath + '/app.js');
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
    }

    /**
     * Read app.json from current project.
     * @returns {Promise<void>}
     * @private
     */
    async _loadAppConfig() {
        const jsonFile = await this.loadFile(this.projectPath + '/app.json');
        const jsonText = new TextDecoder().decode(jsonFile);
        this.appConfig = JSON.parse(jsonText);
    }

    /**
     * Find initial module name for current app.
     * @returns {*|string}
     */
    getInitModuleName() {
        const appConfig = this.appConfig;

        if(appConfig.app.appType === "watchface") {
            // Run as watchface
            let modulePath = "watchface/index";
            if(appConfig.module && appConfig.module.watchface)
                modulePath = appConfig.module.watchface.path;

            return modulePath
        } else if(appConfig.app.appType === "app") {
            // Run as app
            return appConfig.module.page.pages[0];
        } else throw new Error("Unsupported appType");
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
            const vfsPath = urls[i].replace(this.projectPath, vfsRoot);
            this.vfs[vfsPath] = contents[i];
        }
    }

    /**
     * Will stop and destroy current runtime.
     * @private
     */
    _finishCurrentRuntime() {
        this.currentRuntime.callDelegates("pause_call");
        this.currentRuntime.uiPause = true;
        this.currentRuntime.destroy();
    }

    /**
     * Set new currentRuntime and refresh screen
     * @param runtime new runtime
     * @private
     */
    _attachRuntime(runtime) {
        const SL_DESCRIPTOR = {
            1: "(normal)",
            2: "(aod)",
            4: "(settings)"
        }
        this.renderScroll = 0;

        this._lastCanvas = null;
        this.currentRuntime = runtime;
        runtime.refresh_required = 'attach';

        this.onConsole("ZeppPlayer", [
            "Switch to",
            runtime.scriptPath.split("/").pop(),
            SL_DESCRIPTOR[runtime.showLevel]
        ]);
    }

    getModulePath(modulePath) {
        return this.projectPath + "/" + modulePath + ".js";
    }

    async enterPage(url, param) {
        // Down current page
        this._finishCurrentRuntime();
        this.backStack.push([
            this.currentRuntime.scriptPath,
            this.currentRuntime.onInitParam
        ]);

        // Start new page
        const runtime = new ZeppRuntime(this, this.getModulePath(url), 1);
        runtime.onInitParam = param;
        await runtime.start();
        this._attachRuntime(runtime);
    }

    async back() {
        if(this.backStack.length < 1) return;
        this._finishCurrentRuntime();

        // Get prev
        const [script, param] = this.backStack.pop();
        const runtime = new ZeppRuntime(this, script, 1);
        runtime.onInitParam = param;
        await runtime.start();

        this._attachRuntime(runtime);
    }

    async finish() {
        for(const runtime of [this.wfBaseRuntime, this.wfSubRuntime, this.currentRuntime]) {
            if(runtime) await runtime.destroy();
        }

        this.wfBaseRuntime = null;
        this.wfSubRuntime = null;
        this.currentRuntime = null;
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

        // Create first runtime
        const path = this.getModulePath(this.getInitModuleName());
        const runtime = new ZeppRuntime(this, path, 1);
        this.wfBaseRuntime = runtime;

        // Try to execute their js
        try {
            await runtime.start();
        } catch(e) {
            if(this.autoFixGlobalScopeError(e)) {
                this.onConsole("ZeppPlayer", ["Auto-fix applied, restarting..."])
                return await this.init();
            }

            console.error(e);
            this.onConsole("ZeppPlayer", ["Init failed"]);
        }

        // Attach runtime, switch to subpage, if required
        this._attachRuntime(runtime);
        if(this._currentRenderLevel !== 1) {
            const val = this._currentRenderLevel;
            this._currentRenderLevel = 1;
            await this.setRenderLevel(val);
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
            const path = this.getModulePath(this.getInitModuleName());
            this.wfSubRuntime = new ZeppRuntime(this, path, val);
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
        this._attachRuntime(val === 1 ? this.wfBaseRuntime : this.wfSubRuntime);

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

        await this.currentRuntime.render(canvas);

        // Frames
        if(this.showEventZones) {
            await this.overlayTool.drawEventZones(canvas, runtime.events);
        }

        // Shifts
        if(this.withShift) {
            if(this.render_counter % 15 === 0) 
                this.performShift(this.render_counter / 15);
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
        if(this.render_overlay && this.profileData.hasOverlay) {
            await this.overlayTool.drawDeviceFrame(canvas);
        }

        this.render_counter = (this.render_counter + 1) % 3000;
        this._lastCanvas = canvas;

        return canvas;
    }

    performShift(tick) {
        for(let i in this._deviceState) {
            if(this._deviceState[i].shift) {
                const v = this._deviceState[i].shift(tick, this._deviceState[i]);
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
