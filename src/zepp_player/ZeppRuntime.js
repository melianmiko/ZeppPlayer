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
    refresh_required = "";
    animMaxFPS = false;
    
    constructor(player, scriptPath, showLevel) {
        this.player = player;
        this.scriptPath = scriptPath;
        this.showLevel = showLevel;
        this.render_counter = 0;

        this.vfs = this.player.vfs;
        this.screen = this.player.screen;
        this.profileData = this.player.profileData;
        this.appConfig = this.player.appConfig;
    }

    get renderScroll() {
        return this.player.renderScroll;
    }

    set renderScroll(val) {
        this.player.renderScroll = val;
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
        console.debug("ZeppRuntime.start()",
            this.scriptPath.split("/").pop() + ":" + this.scriptPath);

        const extra = this.player.getEvalAdditionalData(this.scriptPath);
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

        const script = `${extra}\n(${Object.keys(env).toString() }) => {${text}}`;

        try {
            const fnc = eval(script)
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
            this.onConsole("error", ["Module start error", e]);
            throw e;
        }
    }

    postInit() {
        this.callDelegates("resume_call");
        this.initTime = Date.now();
    }

    async render(canvas) {
        // Prepare props
        this.events = [];
        this.postRenderTasks = [];
        this.contentHeight = 0;
        this.refresh_required = "";
        this.render_counter = (this.render_counter + 1) % 3000;

        // Render all widgets
        const stages = {
            normal: [],
            postReverse: [],
            toplevel: [],
        }

        for(let i in this.widgets) {
            const widget = this.widgets[i];
            if(!widget) continue;
            const stage = widget._renderStage ? widget._renderStage : "normal";
            if(stages[stage])
                stages[stage].push(widget);
        }
        stages.postReverse.reverse();

        for(let stage in stages) {
            for(let i in stages[stage]) {
                const widget = stages[stage][i];
                if(!widget) continue;

                await this.renderWidget(widget, canvas);
            }
        }

        // Handle overscroll
        const maxScroll = this.contentHeight - this.screen[1]
        if(this.renderScroll > maxScroll) {
            this.renderScroll = maxScroll;
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

    setPause(val) {
        this.callDelegates(val ? "pause_call" : "resume_call");
        this.uiPause = val;
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
        console.debug("ZeppRuntime.destroy()",
            this.scriptPath.split("/").pop() + ":" + this.scriptPath);
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

    addPostRenderTask(fnc) {
        this.postRenderTasks.push(fnc);
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
            console.warn(`%c Widget %c${title} %c${subtitle}%c render failed`,
                "font-weight: bold",
                "color: initial; font-weight: bold",
                "color: #999; font-weight: bold",
                "font-weight: bold", "\n\n",
                "CONFIG: ", widget.config, "\n",
                "ERROR: ", e);
        }

        ctx.globalAlpha = 1;
    }

    getImageFormat(path) {
        path = this.player.getVfsAssetPath(path);
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

    autoFixGlobalScopeError() {
        this.player.autoFixGlobalScopeError(...arguments);
    }

    back() {
        return this.player.back(...arguments);
    }
}