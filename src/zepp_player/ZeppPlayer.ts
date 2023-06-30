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

import {DeviceState} from "./DeviceStateObject.js";
import {PersistentStorage} from "./PersistentStorage.js";
import Overlay from "./ui/Overlay.js";
import ZeppRuntime from "./ZeppRuntime.js";
import {TGAImage} from "./TgaImage";
import {AppEnvironment} from "./SyystemEnvironment";
import {DeviceInfo, DeviceProfiles} from "./DeviceProfiles";
import {MiniSignal} from 'mini-signals';
import {CanvasEntry, ImageEntry} from "./types/EnvironmentTypes";
import {DeviceStateEntry} from "./device_state/DeviceStateEntry";
import {ZeppAppJson} from "./types/ZeppAppJson";
import {DeviceStateFetchType, ListDirectoryResponseEntry, PlayerConfig, RenderLevel} from "./types/PlayerTypes";

const profiles = new DeviceProfiles();

export default abstract class ZeppPlayer {
    public refresh_required: string = "init";

    public config: PlayerConfig = {
        renderWithoutTransparency: true,
        renderDeviceOverlay: true,
        enableRTC: false,
        renderLevel: 1,
        renderScroll: 0,
        showEventZones: false,
        withAutoIncrement: false,
    }
    public profileName: keyof DeviceProfiles = "sb7";
    public projectPath: string = "";
    public appConfig: ZeppAppJson = null;
    public currentRuntime: ZeppRuntime = null;
    public onConsoleOutput = new MiniSignal<[string, any[], any]>();
    public onProjectChanged = new MiniSignal<[string, any]>();
    public deviceState = new DeviceState();
    public onConfigChanged = new MiniSignal<[string, any]>();

    protected onStateChanged = new MiniSignal<[string]>();
    protected vfs: {[path: string]: ArrayBuffer} = {};

    private lastCanvas: CanvasEntry = null;
    private appEnv: AppEnvironment = null;
    private render_counter: number = 0;
    private wfBaseRuntime: ZeppRuntime = null;
    private wfSubRuntime: ZeppRuntime = null;
    private backStack: [string, string][] = [];
    private imgCache: {[path: string]: ImageEntry | CanvasEntry} = {};
    private globalScopeFix: string[] = [];
    private overlayTool: Overlay;

    get profileData(): DeviceInfo {
        return profiles[this.profileName];
    }

    /**
     * @deprecated
     */
    get screen() {
        return [this.profileData.screenWidth, this.profileData.screenHeight];
    }

    protected constructor() {
        this.config = new Proxy(this.config, {
            set: this.changeOption.bind(this)
        });

        this.onConfigChanged.add(() => {
            if(this.currentRuntime)
                this.currentRuntime.refresh_required = "config_changed";
        })

        this.onConsoleOutput.add((_, data) => {
            if(data[0] instanceof Error) {
                if(this.autoFixGlobalScopeError(data[0])) {
                    console.log("Env fixed, restarting");
                    setTimeout(() => this.init(), 10);
                }
            }
        })

        setInterval(this.handleSecondChanged.bind(this), 1000);
    }

    /**
     * Get asset image from app-relative path
     * @param path image path
     * @returns {Promise<HTMLCanvasElement|*>} Target image canvas
     */
    async getAssetImage(path: string) {
        path = this.getVfsAssetPath(path);
        if(this.imgCache[path]) return this.imgCache[path];
        if(!this.vfs[path]) throw new Error("Undefined asset: " + path);

        const data = this.vfs[path];
        const uint = new Uint8Array(data);

        let img: ImageEntry | CanvasEntry;
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
        this.deviceState = new DeviceState();
        PersistentStorage.wipe();
    }

    getVfsAppPath() {
        const pkg = this.appConfig.app;
        const idn = pkg.appId.toString(16).padStart(8, "0").toUpperCase();
        return `/storage/js_${pkg.appType}s/${idn}`;
    }

    getVfsAssetPath(path: string) {
        return `${this.getVfsAppPath()}/assets/${path}`;
    }

    getDeviceState(type: keyof DeviceState, dataType?: DeviceStateFetchType) {
        const v = this.deviceState[type];
        switch(dataType) {
            case DeviceStateFetchType.progress:
                return Math.min(1, v.getProgress(this));
            case DeviceStateFetchType.pointer_progress:
                return v.getProgress(this);
            case DeviceStateFetchType.string:
                return v.getString(this);
            case DeviceStateFetchType.maxLength:
                return v.displayConfig.maxLength;
            case DeviceStateFetchType.boolean:
                return v.getBoolean(this);
            default:
                if(v.getNumber) return v.getNumber(this);
                return v.value;
        }
    }

    setDeviceState(type: keyof DeviceState, value: any, requireRefresh: boolean = true) {
        (this.deviceState[type] as DeviceStateEntry<any>).setValue(value);
        this.onStateChanged.dispatch(type);

        if(this.currentRuntime && requireRefresh)
            this.currentRuntime.refresh_required = "set_state";
    }

    async setProject(path: string) {
        this.projectPath = path;
        this.overlayTool = new Overlay(this);
        this.vfs = {};
        this.imgCache = {};
        this.config.renderScroll = 0;

        await this._loadAppConfig();
        await this._loadAppJs();
        await this.overlayTool.init();
        await this.preloadProjectAssets(path + "/");

        this.onProjectChanged.dispatch(this.projectPath, this.appConfig);
    }

    async restart() {
        await this.finish();
        await this.setProject(this.projectPath);
        await this.init();
    }

    async enterPage(url: string, param: string) {
        // Down current page
        this._finishCurrentRuntime();
        this.backStack.push([
            this.currentRuntime.scriptPath,
            this.currentRuntime.onInitParam
        ]);
        this.config.renderScroll = 0;

        // Start new page
        const runtime = new ZeppRuntime(this, this.getModulePath(url), 1);
        runtime.onInitParam = param;
        await runtime.start();
        this._attachRuntime(runtime);
    }

    async back() {
        if(this.backStack.length < 1) {
            this.onConsole("device", ["back(): backStack is empty"])
            return;
        }
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
        this.backStack = [];
        this.onStateChanged.detachAll();
    }

    async init(): Promise<void> {
        await this.finish();
        this.onConsoleOutput.dispatch("PlayerRestarted", [], {});

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

        runtime.postInit();

        // Attach runtime, switch to subpage, if required
        this._attachRuntime(runtime);
        if(this.config.renderLevel !== 1) {
            const val = this.config.renderLevel;
            this.config.renderLevel = 1;
            await this.setRenderLevel(val);
        }
    }

    async setRenderLevel(val: RenderLevel) {
        if(this.appConfig.app.appType !== "watchface") return;
        if(val === this.config.renderLevel) return;

        const currentVal = this.config.renderLevel;

        if(this.wfSubRuntime) {
            // Destroy sub runtime
            this.wfSubRuntime.destroy();
            this.wfSubRuntime = null;
        }

        if(val !== 1) {
            // Prepare sub-runtime
            const path = this.getModulePath(this.getInitModuleName());
            this.wfSubRuntime = new ZeppRuntime(this, path, val);
            try {
                await this.wfSubRuntime.start();
            } catch(e) {
                this.onConsole("Error", ["Sub-runtime fail", e]);
            }

            this.wfSubRuntime.postInit();
        }

        if(val === 1 && currentVal !== 4) {
            this.wfBaseRuntime.callDelegates("resume_call");
            this.wfBaseRuntime.uiPause = false;
        } else if(currentVal === 1) {
            this.wfBaseRuntime.callDelegates("pause_call");
            this.wfBaseRuntime.uiPause = true;
        }

        this.config.renderLevel = val;
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

        if(!runtime.refresh_required && this.lastCanvas && !force)
            return this.lastCanvas;

        let canvas = this.newCanvas();
        let ctx = canvas.getContext("2d");

        canvas.width = this.profileData.screenWidth;
        canvas.height = this.profileData.screenHeight + this.config.renderScroll;

        // Fill with black
        if(this.config.renderWithoutTransparency) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await this.currentRuntime.render(canvas);

        // Frames
        if(this.config.showEventZones) {
            await this.overlayTool.drawEventZones(canvas, runtime.events);
        }

        // Shifts
        if(this.config.withAutoIncrement) {
            if(this.render_counter % 15 === 0)
                this.performShift(this.render_counter / 15);
            runtime.refresh_required = "shift";
        }

        if(this.config.renderScroll !== 0) {
            const newCanvas = this.newCanvas();
            newCanvas.width = canvas.width;
            newCanvas.height = this.profileData.screenHeight;
            newCanvas.getContext("2d").drawImage(canvas, 0, -this.config.renderScroll);
            canvas = newCanvas;
        }

        // Circle
        if(this.config.renderDeviceOverlay && this.profileData.circleScreen) {
            const size = canvas.width;
            const newCanvas = this.newCanvas();
            newCanvas.width = size;
            newCanvas.height = size;
            const ctx = newCanvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, false);
            ctx.clip();
            ctx.drawImage(canvas, 0, 0);
            canvas = newCanvas;
        }

        // Overlay
        if(this.config.renderDeviceOverlay && this.profileData.hasOverlay) {
            await this.overlayTool.drawDeviceFrame(canvas);
        }

        this.render_counter = (this.render_counter + 1) % 3000;
        this.lastCanvas = canvas;

        return canvas;
    }

    onConsole(tag: string, data: any[], extra?: any) {
        this.onConsoleOutput.dispatch(tag, data, extra);
    }

    abstract newCanvas(): CanvasEntry;

    protected abstract _loadPNG(data: ArrayBuffer): Promise<ImageEntry>;

    protected abstract listDirectory(path: string): Promise<ListDirectoryResponseEntry[]>;

    protected abstract loadFile(path: string): Promise<ArrayBuffer>;

    protected abstract getEvalAdditionalData(path: string): string;

    private handleSecondChanged() {
        const now = new Date();

        // Emulate events for RTC mode
        if(this.config.enableRTC) {
            if(this.currentRuntime)
                this.currentRuntime.refresh_required = "rtc_timer";
            if(now.getSeconds() === 0)
                this.onStateChanged.dispatch("MINUTE");
            if(now.getSeconds() === 0 && now.getMinutes() === 0)
                this.onStateChanged.dispatch("HOUR");
        }
    }

    private changeOption(obj: any, prop: keyof PlayerConfig, value: any) {
        obj[prop] = value;

        this.onConfigChanged.dispatch(prop, value);
        return true;
    }

    /**
     * Find initial module name for current app.
     * @returns {*|string}
     */
    private getInitModuleName() {
        const appConfig = this.appConfig;

        if(appConfig.targets) {
            // Non-compiled zeus app...
            // Use random device ident for now
            const ident = Object.keys(appConfig.targets)[0];
            appConfig.module = appConfig.targets[ident].module;
        }

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

    /**
     * Read app.json from current project.
     * @returns {Promise<void>}
     * @private
     */
    private async _loadAppConfig() {
        const jsonFile = await this.loadFile(this.projectPath + '/app.json');
        const jsonText = new TextDecoder().decode(jsonFile);
        this.appConfig = JSON.parse(jsonText);
    }

    private async readDirectoryRecursive(path: string, arr: string[] = null) {
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

    private async preloadProjectAssets(path: string) {
        const urls = await this.readDirectoryRecursive(path);
        const contents = await Promise.all(urls.map(this.loadFile));
        const vfsRoot = this.getVfsAppPath();

        for(let i = 0; i < urls.length; i++) {
            const vfsPath = urls[i].replace(this.projectPath, vfsRoot);
            this.vfs[vfsPath] = contents[i];
        }
    }

    /**
     * Parse error message and try to fix global undefined vars
     * @param e Error obj
     */
    private autoFixGlobalScopeError(e: Error) {
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

    /**
     * Will stop and destroy current runtime.
     * @private
     */
    private _finishCurrentRuntime() {
        this.currentRuntime.callDelegates("pause_call");
        this.currentRuntime.uiPause = true;
        this.currentRuntime.destroy();
    }

    /**
     * Set new currentRuntime and refresh screen
     * @param runtime new runtime
     * @private
     */
    private _attachRuntime(runtime: ZeppRuntime) {
        const SL_DESCRIPTOR: {[id: number]: string} = {
            1: "(normal)",
            2: "(aod)",
            4: "(settings)"
        }

        this.lastCanvas = null;
        this.currentRuntime = runtime;
        runtime.refresh_required = 'attach';

        this.onConsole("ZeppPlayer", [
            "Switch to",
            runtime.scriptPath.split("/").pop(),
            SL_DESCRIPTOR[runtime.showLevel]
        ]);
    }

    /**
     * Read and execute app.js form current project
     * @returns {Promise<void>}
     * @private
     */
    private async _loadAppJs() {
        const appEnv = new AppEnvironment(this);

        try {
            const appJsFile = await this.loadFile(this.projectPath + '/app.js');
            const appJsText = new TextDecoder().decode(appJsFile);

            const extra = this.getEvalAdditionalData(this.projectPath + '/app.js');
            const str = `${extra}\n(${Object.keys(appEnv).toString() }) => {${appJsText};}`;
            const appJs = eval(str);
            appJs(...Object.values(appEnv));
        } catch (e) {
            console.warn("app.js exec failed", e);
        }

        this.appEnv = appEnv;
    }

    private getModulePath(modulePath: string) {
        return `${this.projectPath}/${modulePath}.js`;
    }

    private performShift(tick: number) {
        const deviceState = this.deviceState as any;
        for(const i in deviceState) {
            if(deviceState[i].performShift)
                deviceState[i].performShift(tick, this);
        }
    }
}
