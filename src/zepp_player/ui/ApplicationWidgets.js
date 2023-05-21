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

import { BaseWidget } from "./widget/BaseWidget.ts";
import HuamiUIMock from "./HuamiUI.js";
import { MissingWidget } from "./ImagingWidgets.js";

/**
 * hmUI.widget.WIDGET_DELEGATE
 */
export class DelegateWidget extends BaseWidget {
    async render() {}
}

/**
 * hmUI.widget.GROUP
 */
export class GroupWidget extends BaseWidget {
    static banlist = [
        "WATCHFACE_EDIT_MASK",
        "WATCHFACE_EDIT_FG_MASK",
        "WATCHFACE_EDIT_BG",
        "WATCHFACE_EDIT_GROUP",
        "GROUP"
    ];

    constructor(config) {
        super(config);
        this.widgets = [];
        config.__content = this.widgets;
    }

    async render(canvas, player) {
        const tempCanvas = player.newCanvas();
        tempCanvas.width = this.config.w;
        tempCanvas.height = this.config.h;

        for(let i in this.widgets) {
            const widget = this.widgets[i];
            widget.config.__eventOffsetX = this.config.x;
            widget.config.__eventOffsetY = this.config.y;
            await player.renderWidget(widget, tempCanvas);
        }

        canvas.getContext("2d").drawImage(tempCanvas, this.config.x, this.config.y);
    }

    createWidget(type, config) {
        let Widget;
        if(!type) {
            Widget = MissingWidget;
        } else {
            Widget = (new HuamiUIMock())._widget[type];
        }

        if(typeof config !== "object") {
            config = {};
        }

        if(GroupWidget.banlist.indexOf(type) > -1) {
            this.runtime.onConsole("SystemWarning", ["You can't place", type, 'into group']);
            return null;
        }

        config.__widget = type;
        config.__id = (this.config.__id+1 << 8) + this.widgets.length;
        config.__runtime = this.runtime;

        const i = new Widget(config);
        this.widgets.push(i);
        this.config.__runtime.refresh_required = "add_widget_group";

        return i;
    }
}

/**
 * hmUI.widget.STATE_BUTTON
 */
export class StateButtonWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.addEventListener("onmouseup", () => {
            this.config.__radioGroup.setProperty("checked", this);
        })
    }

    async render(canvas, player) {
        const groupConfig = this.config.__radioGroup.config;
        const src = groupConfig.checked === this ? groupConfig.select_src : groupConfig.unselect_src;
        const img = await player.getAssetImage(src);

        const defaults = {x: 0, y: 0, w: img.width,  h: img.height};
        const config = {...defaults, ...this.config};
        canvas.getContext("2d").drawImage(img, config.x + groupConfig.x, config.y + groupConfig.y);

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + config.w,
            config.y + config.h
        ]);
    }
}

/**
 * hmUI.widget.RADIO_GROUP
 */
export class RadioGroupWidget extends GroupWidget {
    constructor(config) {
        super(config);
        this.optIndex = 0;
    }

    setProperty(prop, val) {
        if(prop === "checked") {
            const {__radioGroup, __index} = val.config;
            this.config.check_func(__radioGroup, __index, true);
            this.runtime.refresh_required = "group_switch";
        }

        return super.setProperty(prop, val);
    }

    async render(canvas, player) {
        for(let i in this.widgets) {
            const widget = this.widgets[i];
            widget.config.__eventOffsetX = this.config.x;
            widget.config.__eventOffsetY = this.config.y;
            await player.renderWidget(widget, canvas);
        }
    }

    createWidget(type, config) {
        if(type === "STATE_BUTTON") {
            config.__radioGroup = this;
            config.__index = this.optIndex;
            this.optIndex++;
        }

        return super.createWidget(type, config);
    }
}