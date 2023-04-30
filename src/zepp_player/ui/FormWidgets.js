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

import { zeppColorToHex } from "../Utils.js";
import { BaseWidget } from "./BaseWidget.js";
import { FillRectWidget } from "./DrawingWidgets.js";
import { ImageWidget } from "./ImagingWidgets.js";
import {TextWidget} from "./widget/TextWidget";

/**
 * hmUI.widget.BUTTON
 */
export class ButtonWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.pressed = false;
        config.alpha = undefined;

        this.addEventListener("onmousedown", () => {
            this.pressed = true;
            config.__runtime.refresh_required = "button"; // we changed color/bg
        });
        this.addEventListener("onmouseup", (info) => {
            this.pressed = false;
            config.__runtime.refresh_required = "button"; // we changed color/bg
            if(config.click_func) config.click_func(this);
        });

        this.addEventListener = () => {}; // ignore other events
    }

    async render(canvas, player) {
        const config = this.config;
        const w = config.w ? config.w : 0;
        const h = config.h ? config.h : 0;

        if(config.press_src && config.normal_src) {
            // Img bg
            const src = this.pressed ? config.press_src : config.normal_src;
            const img = await player.getAssetImage(src);
            ImageWidget.draw(img, canvas, player, {
                x: config.x + Math.max(0, (w - img.width) / 2),
                y: config.y + Math.max(0, (h - img.height) / 2)
            });
        } else {
            const normalColor = config.normal_color ? zeppColorToHex(config.normal_color) : "#000000";
            const pressedColor = config.press_color ? zeppColorToHex(config.press_color) : "#CCCCCC";
            const color = this.pressed ? pressedColor : normalColor;

            FillRectWidget.draw(canvas, {
                ...config,
                color: color
            }, "fill", player);
        }

        const textLayer = await TextWidget.drawText({
            ...config,
            align_h: "center_h",
            align_v: "center_v",
            color: config.color !== undefined ? config.color : 0xffffff
        }, player);
        canvas.getContext("2d").drawImage(textLayer, config.x, config.y);

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + config.w,
            config.y + config.h
        ])
    }
}