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
    getPropertyBanlist = [];

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
                if(this.setPropertyBanlist.indexOf(a) > -1) {
                    const info = `You can't set ${a} in ${this.constructor.name} via hmUI.prop.MORE. Player crashed.`;
                    this.player.onConsole("SystemWarning", [info]);
                    this.player.finish();
                    throw new Error(info);
                }
                this.config[a] = val[a];
            }
            this.player.refresh_required = "set_prop";
            return;
        }

        this.config[prop] = val;
        this.player.refresh_required = "set_prop";
    }

    getProperty(key, second) {
        if(key == "more") {
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
