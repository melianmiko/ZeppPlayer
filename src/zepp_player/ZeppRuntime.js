import { createPageEnv } from "./SyystemEnvironment";
import { ScreenRootEventHandler } from "./ui/ScreenRootEventHandler";

export default class ZeppRuntime {
    widgets = [];
    events = [];
    postRenderTasks = [];
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
        this.screen = this.player.screen;
        this.appConfig = this.player.appConfig;
        this.withScriptConsole = this.player.withScriptConsole;
    }

    get language() {
        switch(this.fullLanguage) {
            case "zh-CN":
                return "sc";
            case "zh-TW":
                return "tc";
            default:
                return "en";
        }
    }

    get fullLanguage() {
        return this.getDeviceState("OS_LANGUAGE", "string");
    }

    async start() {
        if(this.initTime) this.destroy();
        this.onConsole("runtime", [
            "Begin runtime init",
            `SL:${this.showLevel}`,
            this.scriptPath.split("/").pop()
        ]);

        const extra = this.player.getEvalAdditionalData();
        const scriptFile = await this.player.loadFile(this.scriptPath);
        const text = new TextDecoder().decode(scriptFile);

        this.appGestureHandler = () => false;
        this.rootEventHandler = new ScreenRootEventHandler(this);

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
        this.contentHeight = 0;
        this.onConsole("runtime", [
            "Runtime destroyed",
            `SL:${this.showLevel}`,
            this.scriptPath.split("/").pop()
        ]);
    }

    handleEvent(name, x, y, info) {
        y += this.player.renderScroll;

        if(this.rootEventHandler[name])
            this.rootEventHandler[name](info);

        for(let i = this.events.length-1; i >= 0; i--) {
            const data = this.events[i];
            if(data.x1 < x && x < data.x2 && data.y1 < y && y < data.y2) {
                if(data.events[name])
                    data.events[name](info);
                return;
            }
        }

        // if(name === "onmousemove")
        //     this.rootEventHandler.onmousemove(info);
    }

    dropEvents(events, x1, y1, x2, y2) {
        this.events.push({
            events: events,
            x1, y1, x2, y2
        });

        if(y2 > this.contentHeight) this.contentHeight = y2;
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
        this.postRenderTasks = [];
        this.contentHeight = 0;
        this.refresh_required = false;
        this.render_counter = (this.render_counter + 1) % 3000;
    }

    addPostRenderTask(fnc) {
        this.postRenderTasks.push(fnc);
    }

    async onRenderFinish() {
        // Handle overscroll
        const maxScroll = this.contentHeight - this.screen[1]
        if(this.player.renderScroll > maxScroll) {
            this.player.renderScroll = maxScroll;
        }

        // Run post-render tasks
        for(const fnc of this.postRenderTasks) {
            try {
                await fnc();
            } catch(e) {
                console.warn("Post-render task failed", fnc, e);
            }
        }
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