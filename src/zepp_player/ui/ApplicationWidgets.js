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

import { BaseWidget } from "./BaseWidget.js";
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
        super.dropEvents(player, [
            this.config.x, 
            this.config.y,
            this.config.x + this.config.w,
            this.config.y + this.config.h
        ]);
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
            this.player.onConsole("SystemWarning", ["You can't place", type, 'into group']);
            return null;
        }

        config.__widget = type;
        config.__id = (this.config.__id+1 << 8) + this.widgets.length;
        config.__runtime = this.config.__runtime;

        const i = new Widget(config);
        this.widgets.push(i);
        this.config.__runtime.refresh_required = "add_widget_group";

        return i;
    }
}
