import { setupEnvironment } from "./SyystemEnvironment";

export default class ZeppRuntime {
    widgets = [];
    events = [];
    onDestroy = [];
    env = null;
    module = null;
    initTime = null;
    pause = null;
    refresh_required = false;
    
    constructor(player, scriptPath, showLevel) {
        this.player = player;
        this.scriptPath = scriptPath;
        this.showLevel = showLevel;
        this.render_counter = 0;

        this.readCache = this.player.readCache;
        this.language = this.player.language;
        this.screen = this.player.screen;
        this.withScriptConsole = this.player.withScriptConsole;
    }

    async start() {
        if(this.initTime) this.destroy();
        this.onConsole("runtime", ["Begin runtime init", `SL:${this.showLevel}`]);

        const extra = this.player.getEvalAdditionalData();
        const scriptFile = await this.player.loadFile(this.scriptPath);
        const text = new TextDecoder().decode(scriptFile);

        const env = setupEnvironment(this);
        if(this.player.globalScopeFix.length > 0) {
            for(let i in this.player.globalScopeFix) 
                env[this.player.globalScopeFix[i]] = 0;

            this.onConsole("SystemWarning", [
                "Fix global var defination, please do not declare variables "+
                " without var/let/const, this is legacy way. List:", this.player.globalScopeFix]);
        }

        const fnc = eval(`(${Object.keys(env).toString() }) => {${text}; \n${extra}\n}`)
        fnc(...Object.values(env));

        if(!env.__$$hmAppManager$$__.currentApp.current.module) {
            this.onConsole("SystemWarning", ["Page/Watchface don't exported."]);
            return;
        }

        this.env = env;
        this.module = env.__$$hmAppManager$$__.currentApp.current.module;
        this.render_counter = 0;

        if(this.module.onInit) this.module.onInit();
        if(this.module.build) this.module.build();

        this.callDelegates("resume_call");

        this.initTime = Date.now();
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

    getDeviceState() {
        return this.player.getDeviceState(...arguments);
    }

    handleScriptError() {
        this.player.handleScriptError(...arguments);
    }

    registerEvent(name, x1, y1, x2, y2, fn) {
        if(!this.events[name]) {
            this.events[name] = [];
        }

        this.events[name].push({
            x1, y1, x2, y2, fn
        });
    }

    getAssetPath() {
        return this.player.getAssetPath(...arguments);
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
            console.error("render failed with error", e);
            throw new Error("Render failed");
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

    onConsole(tag, data) {
        const fn = this.scriptPath.substring(this.scriptPath.lastIndexOf("/") + 1);

        this.player.onConsole(tag, data, {
            runtimeID: `${fn} (SL:${this.showLevel})`
        });
    }

    countWidgets() {
        let count = 0;

        for(let i in this.widgets) {
            if(this.widgets[i].config.__content) {
                count += this.widgets[i].config.__content.length;
            }
            count++;
        }

        return count;
    }
}