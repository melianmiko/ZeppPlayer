export class BaseWidget {
    constructor(config) {
        this.config = config;
        this.events = [];
        this.player = config.__player;

        if(!this.config.visible) this.config.visible = true;
    }

    _export() {
        const obj = {
            _renderClass: this.constructor.name,
            _events: this.events
        };

        for(var a in this.config) obj[a] = this.config[a];
        return obj;
    }

    _getPlainConfig() {
        const out = {};

        for(var i in this.config) {
            if(i[0] !== "_") out[i] = this.config[i];
        }

        return out;
    }

    setProperty(prop, val) {
        if(prop == undefined) {
            console.warn("This prop was missing in simulator. Please, debug me...");
        }

        if(prop == "more") {
            for(var a in val) {
                this.config[a] = val[a];
            }
            this.player.refresh_required = "set_prop";
            return;
        }

        this.config[prop] = val;
        this.player.refresh_required = "set_prop";
    }

    getProperty(key) {
        return this.config[key];
    }

    addEventListener(event, fn) {
        this.events.push([event, fn]);
    }

    removeEventListener(event, fn) {
        for(var a in this.events) {
            if(this.events[a][0] == event && this.events[a][1] + "" == fn + "") {
                this.events.splice(a, 1);
                return;
            }
        }
    }

    dropEvents(player, zone=null) {
        const config = this.config;
        if(zone == null) zone = [config.x, config.y, config.w, config.h];

        let [x1, y1, x2, y2] = zone;
        if(config.__eventOffsetX) {
            x1 += config.__eventOffsetX;
            x2 += config.__eventOffsetX;
        }
        if(config.__eventOffsetY) {
            y1 += config.__eventOffsetY;
            y2 += config.__eventOffsetY;
        }

        for(var i in this.events) {
            const [name, fn] = this.events[i];
            player.registerEvent(name, x1, y1, x2, y2, fn);
        }
    }
}
