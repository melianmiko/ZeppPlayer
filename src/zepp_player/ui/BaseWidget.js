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

export class BaseWidget {
    setPropertyBanlist = [];

    constructor(config) {
        this.config = config;
        this.runtime = config.__runtime;

        if(!this.config.visible) this.config.visible = true;

        this.events = {
            "onmousemove": null,
            "onmouseup": null,
            "onmousedown": null
        };
    }

    playerWidgetIdentify() {
        let title = this.config.__widget;
        let subtitle = "", subtitleClass = "";
        if(this.config._name) {
            subtitle = this.config._name;
            subtitleClass = "userDefined";
        } else if(this.config.type) {
            subtitle = this.config.type;
        } else if(this.config.src) {
            subtitle = this.config.src;
        } else if(this.config.text) {
            subtitle = this.config.text;
        }

        return [title, subtitle, subtitleClass];
    }

    _isVisible() {
        if(!this.config.visible) return false;

        const show_level = this.config.show_level;
        return !((show_level & this.runtime.showLevel) === 0 && show_level);
    }

    _getPlainConfig() {
        const out = {};

        for(let i in this.config) {
            if(i[0] !== "_") out[i] = this.config[i];
        }

        return out;
    }

    setProperty(prop, val) {
        if(!this._isVisible() && prop !== "visible") {
            return;
        }

        if(prop === undefined) {
            console.warn("This prop was missing in simulator. Please, debug me...");
        }

        if(prop === "more") {
            for(var a in val) {
                if(this.setPropertyBanlist.indexOf(a) > -1) {
                    const info = `You can't set ${a} in ${this.constructor.name} via hmUI.prop.MORE. Player crashed.`;
                    this.runtime.onConsole("SystemWarning", [info]);
                    this.runtime.destroy();
                    throw new Error(info);
                }
                this.config[a] = val[a];
            }
            this.runtime.refresh_required = "set_prop";
            return;
        }

        this.config[prop] = val;
        this.runtime.refresh_required = "set_prop";
    }

    getProperty(key, second) {
        if(!this._isVisible()) {
            console.warn("attempt to getprop on invisible", this, key);
            return undefined;
        }

        if(key === "more") {
            if(typeof second !== "object") 
                this.player.onConsole("SystemWarning", [
                    "When using getProperty with MORE, you must give empty "+
                    "object as second param."
                ]);
            return this.config;
        }
        return this.config[key];
    }

    addEventListener(event, fn) {
        this.events[event] = fn;
    }

    removeEventListener(event, fn) {
        for(let a in this.events) {
            if(this.events[a][0] === event && this.events[a][1] + "" === fn + "") {
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

        player.dropEvents(this.events, x1, y1, x2, y2);
    }
}
