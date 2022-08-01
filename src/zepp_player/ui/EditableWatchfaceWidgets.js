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

import { PersistentStorage } from "../PersistentStorage.js";
import { BaseWidget } from "./BaseWidget.js";
import { ImageWidget } from "./ImagingWidgets.js";
import {TextWidget} from "./DrawingWidgets";

export class EditableBackground extends BaseWidget {
    constructor(config) {
        super(config);
        this.runtime = config.__runtime;

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(!config.current_type) config.current_type = config.default_id;

        this.addEventListener("onmouseup", () => {
            if(this.runtime.showLevel !== 4) return;
            this._switch();
        })
    }

    _findCurrent() {
        const id = this.config.current_type;
        for(let i in this.config.bg_config) {
            i = parseInt(i);
            if(this.config.bg_config[i].id === id) {
                return i;
            }
        }

        return this.config.default_id;
    }

    _switch() {
        const i = this._findCurrent();
        const nextIndex = (i + 1) % this.config.bg_config.length;
        const val = this.config.bg_config[nextIndex].id;
        PersistentStorage.set("wfEdit", this.config.edit_id, val);
        this.config.current_type = val;
        this.runtime.refresh_required = "edit";
        console.log(1);
    }

    async render(canvas, player) {
        const config = this.config;
        const data = this.config.bg_config[this._findCurrent()];

        if(this.runtime.showLevel === 4) {
            const img = await player.getAssetImage(data.preview);
            const fg = await player.getAssetImage(config.fg);
            const tips = await player.getAssetImage(config.tips_bg);
            const eventsZone = ImageWidget.draw(img, canvas, player, config);
            ImageWidget.draw(fg, canvas, player, config);
            ImageWidget.draw(tips, canvas, player, {
                x: config.tips_x,
                y: config.tips_y
            });
            this.dropEvents(player, eventsZone);
        } else {
            const img = await player.getAssetImage(data.path);
            ImageWidget.draw(img, canvas, player, config);
        }
    }
}

export class EditGroupWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.player = config.__runtime;

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(!config.current_type) config.current_type = config.default_type;

        this.addEventListener("onmouseup", () => {
            if(!this._isActive()) return this._setActive();
            this._switch();
        })
    }

    get _renderStage() {
        return this._isActive() ? "toplevel" : "post";
    }

    getProperty(key, second) {
        if(key === "current_type" && this.runtime.showLevel === 4)
            return -1;

        return super.getProperty(key, second);
    }

    _isActive() {
        return PersistentStorage.get("wfEdit", "focus") === this.config.edit_id;
    }

    _setActive() {
        PersistentStorage.set("wfEdit", "focus", this.config.edit_id);
    }

    async render(canvas, player) {
        if(player.showLevel !== 4) return;
        
        const config = this.config;
        const ctx = canvas.getContext("2d");

        const isActive = this._isActive();
        const currentType = config.current_type;

        let width = config.w ? config.w : 0;
        let height = config.h ? config.h : 0;

        let preview = null, text = null;

        for(let i in config.optional_types) {
            const option = config.optional_types[i];
            if(option.type === currentType) {
                preview = option.preview;
                text = option.title_en;
            }
        }

        try {
            preview = await player.getAssetImage(preview);
            if(width === 0) width = preview.width;
            if(height === 0) height = preview.height;

            const ox = (width - preview.width) / 2;
            const oy = (height - preview.height) / 2;
            ctx.drawImage(preview, config.x + ox, config.y + oy);
        } catch(e) {
            // No preview, ignore
        }

        let dx = config.x, dy = config.y;

        try {
            const overlay = await player.getAssetImage(
                isActive ? config.select_image : config.un_select_image);
            const ox = (width - overlay.width) / 2;
            const oy = (height - overlay.height) / 2;
            ctx.drawImage(overlay, config.x + ox, config.y + oy);
        } catch(e) {
            // No overlay
        }

        if(isActive) try {
            const tipsBg = await player.getAssetImage(config.tips_BG);
            ctx.drawImage(tipsBg, dx + config.tips_x, dy + config.tips_y);

            const textImg = await TextWidget.drawText({
                color: 0, text, text_size: 18,
                w: config.tips_width - (config.tips_margin*2),
                h: tipsBg.height,
                align_h: "center_h",
                align_v: "center_v"
            }, player);

            const croppedTextImg = player.newCanvas();
            croppedTextImg.width = config.tips_width + config.tips_margin;
            croppedTextImg.height = textImg.height;
            croppedTextImg.getContext("2d").drawImage(textImg, config.tips_margin, 0);

            ctx.drawImage(croppedTextImg, dx + config.tips_x, dy + config.tips_y);
        } catch(e) {
            // No tips BG
        }

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + width,
            config.y + height
        ])
    }

    _switch() {
        const currentType = this.config.current_type;
        for(let i in this.config.optional_types) {
            i = parseInt(i);
            if(this.config.optional_types[i].type === currentType) {
                // Get next
                const nextIndex = (i + 1) % this.config.optional_types.length;
                const val = this.config.optional_types[nextIndex];
                PersistentStorage.set("wfEdit", this.config.edit_id, val.type);
                this.config.current_type = val.type;
                this.player.refresh_required = "edit";
            }
        }
    }
}
