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

import ZeppRuntime from "../ZeppRuntime";
import {BaseWidgetConfig, BaseWidgetEventHandler, BaseWidgetEvents} from "../types/BaseWidgetTypes";
import {CanvasEntry} from "../types/EnvironmentTypes";

export abstract class BaseWidget<T> {
    setPropertyBanlist: string[] = [];
    config: BaseWidgetConfig & T;
    runtime: ZeppRuntime;
    positionInfo: [number, number, number, number];
    events: BaseWidgetEvents = {
        "onmousemove": null,
        "onmouseup": null,
        "onmousedown": null
    }

    constructor(config: BaseWidgetConfig & T) {
        this.config = config;
        this.runtime = config.__runtime;
        this.positionInfo = null;

        if(!this.config.visible) this.config.visible = true;

        this.init();
    }

    abstract render(canvas: CanvasEntry, runtime: ZeppRuntime): Promise<void>;

    init() {}

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

    setProperty(prop: string, val: any) {
        const config = this.config as any;

        if(prop === undefined) {
            console.warn("This prop was missing in simulator. Please, debug me...");
        }

        if(prop === "more") {
            for(let a in val) {
                if(this.setPropertyBanlist.indexOf(a) > -1 && this.runtime.profileData.enablePropBanList) {
                    const info = `You can't set ${a} in ${this.constructor.name} via hmUI.prop.MORE. Player crashed.`;
                    this.runtime.onConsole("SystemWarning", [info]);
                    this.runtime.destroy();
                    throw new Error(info);
                }
                config[a] = val[a];
            }
            this.runtime.refresh_required = "set_prop";
            return;
        }

        config[prop] = val;
        this.runtime.refresh_required = "set_prop";
    }

    getProperty(key: string, second?: any): any {
        const config = this.config as any;

        if(!this._isVisible()) {
            console.warn("attempt to getprop on invisible", this, key);
            return undefined;
        }

        if(key === "more") {
            if(typeof second !== "object") 
                this.runtime.onConsole("SystemWarning", [
                    "When using getProperty with MORE, you must give empty "+
                    "object as second param."
                ]);
            return config;
        }

        return config[key];
    }

    addEventListener(event: string, fn: BaseWidgetEventHandler) {
        this.events[event] = fn;
    }

    dropEvents(runtime: ZeppRuntime, zone: number[]=null) {
        const config = this.config;
        if(zone == null)
            zone = [config.x, config.y, config.w, config.h];

        let [x1, y1, x2, y2] = zone;
        if(config.__eventOffsetX) {
            x1 += config.__eventOffsetX;
            x2 += config.__eventOffsetX;
        }
        if(config.__eventOffsetY) {
            y1 += config.__eventOffsetY;
            y2 += config.__eventOffsetY;
        }

        runtime.dropEvents(this.events, x1, y1, x2, y2);
        this.positionInfo = [x1, y1, x2, y2];
    }
}
