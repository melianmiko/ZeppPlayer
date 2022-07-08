import { setupEnvironment } from "./SyystemEnvironment.js";
import { createDeviceState } from "./DeviceStateObject.js";
import { PersistentStorage } from "./PersistentStorage.js";

function log() {
    console.log("[ZeppPlayer]", ...arguments);
}

export default class ZeppPlayer {
    LEVEL_NORMAL = 1;
    LEVEL_AOD = 2;
    LEVEL_EDIT = 4;

    constructor() {
        // Device config
        this.screen = [192, 490];
        this.path_script = "";
        this.path_project = "";

        // Render stage data
        this.currentCanvas = null;
        this.events = {};
        this._img_cache = {};
        this.render_counter = 0;

        // Script data
        this.script_data = "";
        this.page = null;
        this.widgets = [];
        this.globalScopeFix = [];
        this.mustRestart = false;
        this.uiPause = false;

        // App state
        this.settings = {};
        this.onDestroy = [];
        this.current_level = 1;
        this.current_page = 0;
        this.biggestImage = [0, 0];
        this.withScriptConsole = true;

        // Render settings
        this.language = "en";           // en, tc, sc
        this.showEventZones = false;
        this.withoutTransparency = true;
        this.withShift = false;

        // Device state
        this._deviceState = createDeviceState();
        this._deviceStateChangeEvents = {};

        // Events
        this.onConsole = (_, __) => null;
        this.onRestart = () => null;
    }

    wipeSettings() {
        this._deviceState = createDeviceState();
        this.settings = {};
    }

    setPause(val) {
        const delegateName = val ? "pause_call" : "resume_call";
        for(var i in this.widgets) {
            const w = this.widgets[i].config;
            if(w.__widget == "WIDGET_DELEGATE" && w[delegateName]) {
                w[delegateName]();
            }
        }

        const handlername = val ? "onHide" : "onShow";
        if(this.page[handlername]) this.page[handlername];
    }

    handleScriptError(e) {
        if(e.message.endsWith("is not defined")) {
            const name = e.message.split(" ")[0];
            if(this.globalScopeFix.indexOf(name) < 0) {
                log("Attempt to fix strict mode global defination of", name);
                this.globalScopeFix.push(name);
                this.mustRestart = true;
            }
        }
    }

    exportAll() {
        const out = [];
        for(var i in this.widgets) out.push(this.widgets[i]._export());
        return out;
    }

    getDeviceState(type, dataType=false) {
        const v = this._deviceState[type];
        switch(dataType) {
            case "progress":
                return v.getProgress(v);
            case "string":
                return v.getString(v);
            case "maxLength":
                return v.maxLength;
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
            for(var i in this._deviceStateChangeEvents[type]) {
                this._deviceStateChangeEvents[type][i]()
            }
        }
    }

    getAssetImage(path) {
        throw new Error("not overriden");
    }

    getAssetText(path) {
        throw new Error("not overriden");
    }

    async getFileContent(path) {
        throw new Error("not overriden");
    }

    newCanvas() {
        throw new Error("not overriden");
    }

    async setProject(path) {
        const appConfig = JSON.parse(await this.getFileContent(path + '/app.json'));
        let modulePath = "/watchface/index.js";
        if(appConfig.module && appConfig.module.watchface)
            modulePath = appConfig.module.watchface.path + ".js";
        this.path_script = path + "/" + modulePath;
        this.path_project = path;

        log("use script", this.path_script);
    }

    async finish() {
        if(!this.path_script) return;

        if(this.page && this.page.onDestroy) this.page.onDestroy();
        for(var a in this.onDestroy) this.onDestroy[a]();

        this.render_counter = 0;
        this.page = null;
        this.widgets = [];
        this._deviceStateChangeEvents = {};
        this.mustRestart = false;
        this.onDestroy = [];
    }

    getEvalAdditionalData() {
        return '';
    }

    async init() {
        await this.finish();
        
        const extra = this.getEvalAdditionalData();
        const text = await this.getFileContent(this.path_script);
        this.script_data = text;

        // Eval this script
        this.onRestart();
        log("starting wf script...");
        const env = setupEnvironment(this);
        for(let i in this.globalScopeFix) env[this.globalScopeFix[i]] = 0;

        const fnc = eval(`(${Object.keys(env).toString() }) => {${text}; \n${extra}\n}`)

        try {
            fnc(...Object.values(env));

            if(this.page.init_view) this.page.init_view();
            else if(this.page.build) this.page.build();
            else if(this.page.onInit) this.page.onInit();
            else console.error("no supported entry function");
       
            this.setPause(false);

        } catch(e) {
            this.handleScriptError(e);
            if(!this.mustRestart) console.error(e);
        }

        if(this.mustRestart) {
            log("context fixed, restarting...")
            await this.init();
        }
    }

    registerEvent(name, x1, y1, x2, y2, fn) {
        if(!this.events[name]) {
            this.events[name] = [];
        };

        this.events[name].push({
            x1, y1, x2, y2, fn
        });
    }

    handleEvent(name, x, y, info) {
        const events = this.events[name];
        if(!events) return;
        if(events.length == 0) return;

        for(var i = events.length-1; i >= 0; i--) {
            const zone = events[i];
            if(zone.x1 < x && x < zone.x2 && zone.y1 < y && y < zone.y2) {
                zone.fn(info);
                return;
            }
        }
    }

    /**
     * Render current stage.
     * @returns a new canvas
     */
    async render() {
        const canvas = this.newCanvas();
        const ctx = canvas.getContext("2d");

        if(this.biggestImage[0] > this.screen[0] || this.biggestImage[1] > this.screen[1]) {
            console.info("Resize screen to", this.biggestImage);
            this.screen = this.biggestImage;
        }

        canvas.width = this.screen[0];
        canvas.height = this.screen[1];

        // Fill with black
        if(this.withoutTransparency) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Prepare props
        this.currentCanvas = canvas;
        this.events = {};

        // Render all widgets
        const postRender = [];
        for(let i in this.widgets) {
            const widget = this.widgets[i];
            ctx.globalAlpha = widget.config.alpha ? widget.config.alpha / 255 : 1;

            if(widget._renderStage === "post") {
                postRender.push(widget);
                continue;
            }

            await this.renderWidget(widget, canvas);
        }

        for(let i in postRender) {
            const widget = postRender[i];
            await this.renderWidget(widget, canvas);
        }

        // Frames
        if(this.showEventZones) {
            ctx.strokeStyle = "rgba(0, 153, 255, 0.5)";
            ctx.lineWidth = 2;
            for(var name in this.events) {
                for(var i in this.events[name]) {
                    const {x1, y1, x2, y2, fn} = this.events[name][i];
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                }
            }
        }

        // Shifts
        if(this.withShift && this.render_counter % 15 == 0) {
            this.performShift();
        }

        this.render_counter = (this.render_counter + 1) % 3000;

        return canvas;
    }

    performShift() {
        for(var i in this._deviceState) {
            if(this._deviceState[i].shift) {
                const v = this._deviceState[i].shift(this.render_counter, this._deviceState[i]);
                if(v !== null) this.setDeviceState(i, v);
            }
        }
    }

    async renderWidget(widget, canvas) {
        const show_level = widget.config.show_level;
        if((show_level & this.current_level) == 0 && show_level) return;
        if(!widget.config.visible) return;

        try {
            await widget.render(canvas, this);
        } catch(e) {
            console.error("render failed with error", e, "widget", widget._export());
            throw new Error("Render failed");
        }
    }
}
