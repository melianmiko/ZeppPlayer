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

/**
 * hmUI.widget.IMG
 * 
 * Supported props: pos_x, pos_y, center_x, center_y, angle,
 * w, h, x, y, src
 */
export class ImageWidget extends BaseWidget {
    static draw(img, canvas, config) {
        let w = config.w, h = config.h;
        if(!config.w) w = img.width;
        if(!config.h) h = img.height;

        let x = config.x ? config.x : 0,
            y = config.y ? config.y : 0,
            centerX = config.center_x ? config.center_x : 0,
            centerY = config.center_y ? config.center_y : 0,
            posX = config.pos_x ? config.pos_x : 0,
            posY = config.pos_y ? config.pos_y : 0;

        const ctx = canvas.getContext("2d");
        if(config.angle === undefined || config.angle === 0) {
            ctx.drawImage(img, x + posX, y + posY);
            return [
                x + posX, 
                y + posY, 
                x + posX + w, 
                y + posY + h
            ];
        } else {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(config.angle * Math.PI / 180);
            ctx.drawImage(img, posX - centerX, posY - centerY);
            ctx.restore();
            return [
                posX, posY,
                posX + img.width,
                posY + img.height
            ];
        }
    }

    async render(canvas, player) {
        const item = this.config;
        let img, evZone;

        try {
            img = await player.getAssetImage(item.src);
            evZone = ImageWidget.draw(img, canvas, item);
        } catch(e) {
            // Fallback evZone
            evZone = [
                item.x,
                item.y,
                item.x + item.w,
                item.y + item.h
            ];
        }

        if(!item.angle) {
            super.dropEvents(player, evZone);
        }
    }
}


/**
 * hmUI.widget.IMG_CLICK
 */
export class ClickableImageWidget extends ImageWidget {
    constructor(config) {
        super(config);
        this.addEventListener("onmousedown", () => {
            console.info("[IMG_CLICK] " + config.type);
            config.__player.onConsole("IMG_CLICK", ["clicked", config.type]);
        })
    }
}

/**
 * hmUI.widget.IMG_POINTER
 */
export class PointerWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;
        const img = await player.getAssetImage(config.src);

        let angle = config.angle;
        if(config.type) angle = player.getDeviceState(config.type, "progress") * 360;
        if(config.start_angle !== undefined && config.end_angle !== undefined) {
            angle = (angle / 360) * (config.end_angle - config.start_angle) + config.start_angle;
        }

        const conf = {
            center_x: config.center_x,
            center_y: config.center_y,
            pos_x: config.center_x - config.x,
            pos_y: config.center_y - config.y,
            angle
        };

        ImageWidget.draw(img, canvas, conf);
    }
}

/**
 * Placeholder for missing widgets
 */
export class MissingWidget extends ImageWidget {
    constructor(config) {
        super(config);
    }

    async render(a, b) {
        await super.render(a, b);
        if(!this.flag) {
            console.warn("Widget missing", this.config);
            this.flag = true;
        }
    }
}

/**
 * hmUI.widget.TEXT_IMG
 * 
 * Fully implemented
 */
export class TextImageWidget extends BaseWidget {
    setPropertyBanlist = ["text"];
    
    static async draw(player, text, maxLength, config) {
        if(!config.font_array) return null;
        // text = text.toString();

        // Prepare
        let imgs = [];

        // Icon
        let iconImg = null,
            unitImg = null,
            unitPath = config["unit_" + player.language];
        
        let offset = config.h_space ? config.h_space : 0;
        let iconOffset = config.icon_space ? config.icon_space : 0;

        if(config.icon) {
            iconImg = await player.getAssetImage(config.icon);
            imgs.push([iconImg, iconOffset]);
        }

        // Pre-calculate width of text + load imgs
        if((text == "" || text == null || text == undefined) && config.invalid_image) {
            const invalid = await player.getAssetImage(config.invalid_image);
            imgs.push([invalid, offset]);
        } else for(let i in text) {
            let img = null;
            if(text[i] == "-") {
                img = await player.getAssetImage(config.negative_image);
            } else if(text[i] == ".") {
                img = await player.getAssetImage(config.dot_image);
            } else if(text[i] == "u") {
                img = await player.getAssetImage(config["unit_" + player.language]);
            } else {
                i = parseInt(text[i]);
                img = await player.getAssetImage(config.font_array[i]);
            }

            imgs.push([img, offset]);
        }

        // Unit
        if(unitPath) {
            try {
                unitImg = await player.getAssetImage(unitPath);
                imgs.push([unitImg, offset]);
            } catch(e) {}
        }

        if(imgs.length < 1) return player.newCanvas();

        // Remove offset after last img
        imgs[imgs.length - 1][1] = 0;

        // Calculate full width/height
        let fullWidth = 0, fullHeight = 0;
        for(let i in imgs) {
            const [img, offset] = imgs[i];
            fullWidth += img.width + offset;
            fullHeight = Math.max(img.height, fullHeight);
        }

        // Prepare temp canvas
        const tmp = player.newCanvas();
        tmp.width = fullWidth;
        tmp.height = fullHeight;

        const basementImg = await player.getAssetImage(config.font_array[0]);
        let boxWidth = config.w, 
            boxHeight = config.h;

        if(!boxWidth) {
            boxWidth = (basementImg.width + offset) * maxLength;
            if(unitImg) boxWidth += unitImg.width + iconOffset;
            if(iconImg) boxWidth += iconImg.width;
        }

        if(!boxHeight) boxHeight = basementImg.height;
        
        if(boxWidth > tmp.width) tmp.width = boxWidth;
        if(boxHeight > tmp.height) tmp.height = boxHeight;
        if(tmp.width == 0 || tmp.height == 0) return null;

        // Align
        let px = 0;
        switch(config.align_h) {
            case "center_h":
                px = Math.max(0, (tmp.width - fullWidth) / 2);
                break;
            case "right":
                px = Math.max(0, tmp.width - fullWidth);
        }
        
        // Draw
        const ctx = tmp.getContext("2d");
        for(var i in imgs) {
            const [img, offset] = imgs[i];
            ctx.drawImage(img, px, 0);
            px += img.width + offset;
        }

        return tmp;
    }

    async render(canvas, player, customText=null) {
        const config = this.config;

        // Find text
        let text = null, maxLength = 1;
        if(config.type) {
            text = player.getDeviceState(config.type, "string");
            maxLength = player.getDeviceState(config.type, "maxLength");

            if(config.padding) text = text.padStart(maxLength, "0");
        }

        if(config.text !== undefined) text = config.text;
        if(customText !== null) text = customText;

        if(text === null || text === undefined) {
            if(!this.failed) {
                console.warn("No text to display...");
                this.failed = true;
            }
            return;
        }

        // Render text
        const tmp = await TextImageWidget.draw(player, text, maxLength, config);
        if(tmp === null) return;

        // Draw result
        canvas.getContext("2d").drawImage(tmp, config.x, config.y);

        super.dropEvents(player, [
            config.x, 
            config.y, 
            config.x + tmp.widget,
            config.y + tmp.height
        ]);
    }
}

/**
 * hmUI.widget.IMG_ANIM
 * 
 * Fully implemented
 */
export class AnimationWidget extends BaseWidget {
    constructor(config) {
        super(config);
    }
    
    async render(canvas, player) {
        const config = this.config;
        const currentFrame = Math.floor(player.render_counter / player.system_fps * config.anim_fps);

        if(config.anim_status == 0) return;

        let x = config.x, y = config.y;

        let frame = currentFrame % config.anim_size;
        if(config.repeat_count == 1 && currentFrame > config.anim_size)
            frame = config.anim_size - 1;

        const path = config.anim_path + "/" + config.anim_prefix + "_" + frame 
            + "." + config.anim_ext;

        const img = await player.getAssetImage(path);
        canvas.getContext("2d").drawImage(img, x, y);

        super.dropEvents(player, [x, y, x + img.widget, y + img.height]);
        player.refresh_required = "img_anim";
    }
}

/**
 * hmUI.widget.IMG_STATUS
 * 
 * Fully implemented
 */
export class ImageStatusWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;
        const type = this.config.type;
        let x = config.x, y = config.y;
        if(config.pos_x) x += config.pos_x;
        if(config.pos_y) y += config.pos_y;

        try {
            const img = await player.getAssetImage(config.src);
    
            // Render image, if visible
            if(player.getDeviceState(type, "boolean") === true) {
                canvas.getContext("2d").drawImage(img, x, y);
            }

            super.dropEvents(player, [x, y, x + img.width, y + img.height]);
        } catch(e) {
            return;
        }
    }
}

/**
 * hmUI.widget.IMG_PROGRESS
 * 
 * Fully implemented
 */
export class ImageProgressWidget extends BaseWidget {
    async render(canvas, player) {
        const ctx = canvas.getContext("2d");

        let level = this.config.level;
        if(this.config.type) {
            level = Math.floor(player.getDeviceState(this.config.type, "progress") * 
                this.config.image_length);
        }

        for(let i = 0; i < level; i++) {
            const img = await player.getAssetImage(this.config.image_array[i]);
            ctx.drawImage(img, this.config.x[i], this.config.y[i]);
        }
    }
}

/**
 * hmUI.widget.LEVEL
 */
export class LevelWidget extends BaseWidget {
    async render(canvas, player) {
        const ctx = canvas.getContext("2d");

        let level = this.config.level;
        if(this.config.type) {
            let val = player.getDeviceState(this.config.type, "progress");
            if(!val) val = 0;
            level = Math.floor(val * (this.config.image_length-1));
            // console.log(val, level);
        }

        const img = await player.getAssetImage(this.config.image_array[level]);
        ctx.drawImage(img, this.config.x, this.config.y);
    }
}
