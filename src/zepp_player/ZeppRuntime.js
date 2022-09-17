import { createPageEnv } from "./SyystemEnvironment";

export default class ZeppRuntime {
    widgets = [];
    events = [];
    onDestroy = [];
    env = null;
    module = null;
    initTime = null;
    onInitParam = null;

    uiPause = false;
    refresh_required = false;
    animMaxFPS = false;
    
    constructor(player, scriptPath, showLevel) {
        this.player = player;
        this.scriptPath = scriptPath;
        this.showLevel = showLevel;
        this.render_counter = 0;

        this.vfs = this.player.vfs;
        this.path_project = this.player.path_project;
        this.language = this.player.language;
        this.screen = this.player.screen;
        this.appConfig = this.player.appConfig;
        this.withScriptConsole = this.player.withScriptConsole;
    }

    get fullLanguage() {
        return this.getDeviceState("OS_LANGUAGE", "string");
    }

    async start() {
        if(this.initTime) this.destroy();
        this.onConsole("runtime", ["Begin runtime init", `SL:${this.showLevel}`]);

        const extra = this.player.getEvalAdditionalData();
        const scriptFile = await this.player.loadFile(this.scriptPath);
        const text = new TextDecoder().decode(scriptFile);

        const env = createPageEnv(this, this.player.appEnv);
        if(this.player.globalScopeFix.length > 0) {
            for(let i in this.player.globalScopeFix) 
                env[this.player.globalScopeFix[i]] = 0;

            this.onConsole("SystemWarning", [
                "Fix global var defination, please do not declare variables "+
                " without var/let/const, this is legacy way. List:", this.player.globalScopeFix]);
        }

        try {
            const fnc = eval(`(${Object.keys(env).toString() }) => {${text}; \n${extra}\n}`)
            fnc(...Object.values(env));
        } catch(e) {
            this.onConsole("error", ["Script load failed", e]);
            throw e;
        }

        if(!env.__$$hmAppManager$$__.currentApp.current.module) {
            this.onConsole("SystemWarning", ["Page/Watchface don't exported."]);
            return;
        }

        this.env = env;
        this.module = env.__$$hmAppManager$$__.currentApp.current.module;
        this.render_counter = 0;

        try {
            if(this.module.onInit) this.module.onInit(this.onInitParam);
            if(this.module.build) this.module.build();
        } catch(e) {
            this.onConsole("error", ["Module start failed", e]);
            throw e;
        }

        this.callDelegates("resume_call");

        this.initTime = Date.now();
    }

    requestPageSwitch(conf) {
        return this.player.enterPage(conf.url, conf.param);
    }

    destroy() {
        if(this.module && this.module.onDestroy) this.module.onDestroy();
        for(let i in this.onDestroy) {
            this.onDestroy[i]();
        }

        this.onDestroy = [];
        this.widgets = [];
        this.events = [];
        this.module = null;
        this.env = null;
        this.initTime = null;
        this.onConsole("runtime", ["Runtime destroyed", `SL:${this.showLevel}`]);
    }

    dropEvents(events, x1, y1, x2, y2) {
        this.events.push({
            events: events,
            x1, y1, x2, y2
        })
    }

    callDelegates(delegateName) {
        for(let i in this.widgets) {
            const w = this.widgets[i].config;
            if(w.__widget === "WIDGET_DELEGATE" && w[delegateName]) {
                w[delegateName]();
            }
        }
    }

    onRenderBegin() {
        this.events = [];
        this.refresh_required = false;
        this.render_counter = (this.render_counter + 1) % 3000;
    }

    async renderWidget(widget, canvas) {
        const ctx = canvas.getContext("2d");
        const show_level = widget.config.show_level;

        ctx.globalAlpha = widget.config.alpha !== undefined ? widget.config.alpha / 255 : 1;

        if((show_level & this.showLevel) === 0 && show_level) return;
        if(!widget.config.visible) return;

        try {
            await widget.render(canvas, this);
        } catch(e) {
            const [title, subtitle] = widget.playerWidgetIdentify();
            console.warn(`%c Widget %c${title} %c${subtitle} %crender failed`,
                "font-weight: bold",
                "color: initial; font-weight: bold",
                "color: #999; font-weight: bold",
                "font-weight: bold", "\n\n",
                "CONFIG: ", widget.config, "\n",
                "ERROR: ", e);
            throw new Error("widget_fail");
        }

        ctx.globalAlpha = 1;

        if(this.player.withStagingDump) {
            // Stage data
            const st = this.newCanvas();
            st.width = canvas.width;
            st.height = canvas.height;
            st.getContext("2d").drawImage(canvas, 0, 0);

            console.log("[ZeppPlaye] Do stage dump", 
                        this.player.stages.length, 
                        widget.constructor.name, 
                        widget._getPlainConfig());

            this.player.stages.push(st);
        }
    }

    getImageFormat(path) {
        path = this.player.getAssetPath(path);
        if(!this.vfs[path]) throw new Error("Undefined asset: " + path);

        const data = this.vfs[path];
        const uint = new Uint8Array(data);

        if(uint[0] === 137 && uint[1] === 80) {
            return "PNG";
        } else if(uint[2] === 9) {
            return "TGA-RLP";
        } else if(uint[2] === 1) {
            return "TGA-P"
        } else if(uint[2] === 2) {
            return "TGA-RGB";
        }

        return "N/A";
    }

    onConsole(tag, data) {
        this.player.onConsole(tag, data, {
            runtimeID: `SL:${this.showLevel}`
        });
    }

    async getAssetImage() {
        return await this.player.getAssetImage(...arguments);
    }

    addDeviceStateChangeEvent() {
        this.player.addDeviceStateChangeEvent(...arguments);
    }

    newCanvas() {
        return this.player.newCanvas(...arguments);
    }

    getDeviceState() {
        return this.player.getDeviceState(...arguments);
    }

    handleScriptError() {
        this.player.handleScriptError(...arguments);
    }

    back() {
        return this.player.back(...arguments);
    }
}