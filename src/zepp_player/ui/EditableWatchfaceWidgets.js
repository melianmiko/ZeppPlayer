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

/**
 * BaseWidget with some extra fixes for editor widgets.
 */
class BaseEditableWidget extends BaseWidget {
    /**
     * Check, is widget focused
     * @returns {boolean} ture, if focused
     */
    zp_isActive() {
        return PersistentStorage.get("wfEdit", "focus") === this.config.edit_id;
    }

    /**
     * Change active state
     */
    zp_setActive() {
        PersistentStorage.set("wfEdit", "focus", this.config.edit_id);
        this.runtime.refresh_required = "edit";
    }

    /**
     * Don't return current_type if hidden (ZeppOS bug emulation)
     * @param key prop key
     * @param second ??
     * @returns {*|number} value
     */
    getProperty(key, second) {
        if(key === "current_type" && this.runtime.showLevel === 4)
            return -1;

        return super.getProperty(key, second);
    }
}

export class EditableBackground extends BaseEditableWidget {
    constructor(config) {
        super(config);

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(config.current_type === null || config.current_type === undefined)
            config.current_type = config.default_id;

        this.addEventListener("onmouseup", () => {
            if(this.runtime.showLevel !== 4) return;
            if(!this.zp_isActive()) return this.zp_setActive();
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
    }

    async render(canvas, player) {
        const config = this.config;
        const ctx = canvas.getContext("2d");
        const data = this.config.bg_config[this._findCurrent()];

        if(this.runtime.showLevel === 4) {
            const img = await player.getAssetImage(data.preview);
            const fg = await player.getAssetImage(config.fg);
            const eventsZone = ImageWidget.draw(img, canvas, player, config);
            ImageWidget.draw(fg, canvas, player, config);

            if(this.zp_isActive()) player.addPostRenderTask(async () => {
                const tips = await player.getAssetImage(config.tips_bg);

                ImageWidget.draw(tips, canvas, player, {
                    x: config.tips_x,
                    y: config.tips_y
                });

                const textImg = await TextWidget.drawText({
                    color: 0,
                    text: `Background ${data.id}/${config.count}`,
                    text_size: 18,
                    w: tips.width,
                    h: tips.height,
                    align_h: "center_h",
                    align_v: "center_v"
                }, player);

                ctx.drawImage(textImg,
                    config.x + config.tips_x,
                    config.y + config.tips_y);
            });

            this.dropEvents(player, eventsZone);
        } else {
            const img = await player.getAssetImage(data.path);
            ImageWidget.draw(img, canvas, player, config);
        }
    }
}

export class EditPointerWidget extends BaseEditableWidget {
    constructor(config) {
        super(config);

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(config.current_type === null || config.current_type === undefined)
            config.current_type = config.default_id;

        this.addEventListener("onmouseup", () => {
            if(!this.zp_isActive()) return this.zp_setActive();
            this._switch();
        })
    }

    _switch() {
        const currentType = this.config.current_type;
        for(let i = 0; i < this.config.count; i++) {
            if(this.config.config[i].id === currentType) {
                // Get next
                const nextIndex = (i + 1) % this.config.count;
                const val = this.config.config[nextIndex];
                PersistentStorage.set("wfEdit", this.config.edit_id, val.id);
                this.config.current_type = val.id;
                this.runtime.refresh_required = "edit";
                return;
            }
        }
    }

    _findCurrent() {
        const id = this.config.current_type;
        for(let i = 0; i < this.config.count; i++) {
            if(this.config.config[i].id === id) {
                return i;
            }
        }

        return -1;
    }

    getProperty(key, second) {
        if(key === "current_config") {
            // Generate config for pointer
            if(this.runtime.showLevel === 4) return {};

            const i = this._findCurrent();
            const data = this.config.config[i];

            const config = {};
            for(const key of ["hour", "minute", "second"]) {
                if(!data[key]) continue;
                for(const prop in data[key]) {
                    config[`${key}_${prop}`] = data[key][prop];
                }
            }

            return config;
        }

        return super.getProperty(key, second);
    }

    async render(canvas, runtime) {
        if(runtime.showLevel !== 4) return;

        const config = this.config;
        const ctx = canvas.getContext("2d");

        const i = this._findCurrent();
        const preview = await runtime.getAssetImage(config.config[i].preview);
        ctx.drawImage(preview, config.x, config.y);

        try {
            const fg = await runtime.getAssetImage(config.fg);
            ctx.drawImage(fg, config.x, config.y);
        } catch(e) {}

        if(this.zp_isActive()) runtime.addPostRenderTask(async () => {
            const tips = await player.getAssetImage(config.tips_bg);

            ImageWidget.draw(tips, canvas, player, {
                x: config.tips_x,
                y: config.tips_y
            });

            const textImg = await TextWidget.drawText({
                color: 0,
                text: `Pointers ${i + 1}/${config.count}`,
                text_size: 18,
                w: tips.width,
                h: tips.height,
                align_h: "center_h",
                align_v: "center_v"
            }, player);

            ctx.drawImage(textImg,
                config.x + config.tips_x,
                config.y + config.tips_y);
        })

        const boxWidth = Math.min(preview.width, 100);
        const boxHeight = Math.min(preview.height, 100);
        this.dropEvents(runtime, [
            config.x + (preview.width - boxWidth) / 2,
            config.y + (preview.height - boxHeight) / 2,
            config.x + (preview.width - boxWidth) / 2 + boxWidth,
            config.y + (preview.height - boxHeight) / 2 + boxHeight,
        ]);
    }
}

/**
 * WATCHFACE_EDIT_GROUP
 */
export class EditGroupWidget extends BaseEditableWidget {
    get _renderStage() {
        if(this.runtime.showLevel !== 4) return "";
        return this.zp_isActive() ? "toplevel" : "postReverse";
    }

    constructor(config) {
        super(config);

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(config.current_type === null || config.current_type === undefined)
            config.current_type = config.default_type;

        this.addEventListener("onmouseup", () => {
            if(!this.zp_isActive()) return this.zp_setActive();
            this._switch();
        })
    }

    async render(canvas, player) {
        if(player.showLevel !== 4) return;
        
        const config = this.config;
        const ctx = canvas.getContext("2d");

        const isActive = this.zp_isActive();
        const currentType = config.current_type;

        let width = config.w ? config.w : 0;
        let height = config.h ? config.h : 0;

        let preview = null,
            text = "";

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

        if(isActive) player.addPostRenderTask(async () => {
            let tipsBg;
            try {
                tipsBg = await player.getAssetImage(config.tips_BG);
            } catch(e) {
                return;
            }

            ctx.drawImage(tipsBg, dx + config.tips_x, dy + config.tips_y);

            if(!text) return;
            const textImg = await TextWidget.drawText({
                color: 0,
                text,
                text_size: 18,
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
        });

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
                this.runtime.refresh_required = "edit";
                return;
            }
        }
    }
}
