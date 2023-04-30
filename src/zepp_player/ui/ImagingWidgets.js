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
    static draw(img, canvas, player, config) {
        let w = config.w, h = config.h;
        if(!config.w) w = img.width;
        if(!config.h) h = img.height;

        const cnv = player.newCanvas();
        cnv.width = w;
        cnv.height = h;

        let centerX = config.center_x ? config.center_x : 0,
            centerY = config.center_y ? config.center_y : 0,
            posX = config.pos_x ? config.pos_x : 0,
            posY = config.pos_y ? config.pos_y : 0;

        const ctx = cnv.getContext("2d");
        if(config.angle === undefined || config.angle === 0) {
            ctx.drawImage(img, posX, posY);
        } else {
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(config.angle * Math.PI / 180);
            ctx.drawImage(img, posX - centerX, posY - centerY);
            ctx.restore();
        }

        const x = config.x ? config.x : 0;
        const y = config.y ? config.y : 0;
        canvas.getContext("2d").drawImage(cnv, x, y);
        return [x, y, x + w, y + h];
    }

    async render(canvas, player) {
        const item = this.config;
        let img, evZone;

        try {
            img = await player.getAssetImage(item.src);

            if(player.getImageFormat(item.src) === "TGA-RLP" && item.angle) {
                player.onConsole("SystemWarning", [
                    "WARN: MB7 can't rotate images in TGA-RLP format.",
                    "Re-convert file", item.src, "to TGA-P format."
                ]);
                item.angle = 0;
            }

            evZone = ImageWidget.draw(img, canvas, player, item);
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
            config.__runtime.onConsole("IMG_CLICK", ["clicked", config.type]);
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
            x: 0, y: 0, w: canvas.width, h: canvas.height,
            center_x: config.center_x,
            center_y: config.center_y,
            pos_x: config.center_x - config.x,
            pos_y: config.center_y - config.y,
            angle
        };

        ImageWidget.draw(img, canvas, player, conf);
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

    static getAlignOffsetX(align, boxWidth, contentWidth) {
        switch(align) {
            case "center_h":
                return (boxWidth - contentWidth) / 2;
            case "right":
                return boxWidth - contentWidth;
            default:
                return 0;
        }
    }

    static async draw(runtime, text, maxLength, config) {
        if(!config.font_array || config.font_array.length < 1)
            return null;

        text = String(text);

        const countNums = text.replace(/\D/g,'').length;
        const valueMissing = text === "" || text === null || text === undefined;

        const hSpace = config.h_space ? config.h_space : 0;
        const iconSpace = config.icon_space ? config.icon_space : 0;
        const basementImage = await runtime.getAssetImage(config.font_array[0]);

        let fullWidth = (countNums * basementImage.width) + Math.max(0, countNums - 1) * hSpace;

        let iconImg = null,
            unitImg = null,
            dotImage = null,
            negativeImage = null,
            invalidImage = null;

        if(config.invalid_image && valueMissing) {
            invalidImage = await runtime.getAssetImage(config.invalid_image);
            fullWidth = invalidImage;
        }

        if(config.negative_image) {
            negativeImage = await runtime.getAssetImage(config.negative_image);
            if(text.indexOf("-") > -1)
                fullWidth += negativeImage.width + hSpace;
        }

        if(config.dot_image) {
            dotImage = await runtime.getAssetImage(config.dot_image);
            if(text.indexOf(".") > -1)
                fullWidth += dotImage.width + hSpace;
        } else if(text.indexOf(".") > -1) {
            fullWidth += hSpace; // real device bug emulation
        }

        if(config.icon) {
            iconImg = await runtime.getAssetImage(config.icon);
            fullWidth += iconImg.width + iconSpace;
        }

        if(config["unit_" + runtime.language]) {
            try {
                unitImg = await runtime.getAssetImage(config["unit_" + runtime.language]);
                // fullWidth += hSpace + unitImg.width;
                if(text.indexOf("u") < 0) text += "u";
            } catch(e) {}
        }

        // Calculate sizes
        let boxHeight = config.h;
        if(boxHeight === undefined) {
            boxHeight = basementImage.height;
        }

        let boxWidth = config.w;
        if(boxWidth === undefined) {
            const autoNumCount = maxLength === 0 ? countNums : maxLength;
            boxWidth = basementImage.width * autoNumCount + hSpace * (autoNumCount - 1);
            if(iconImg) boxWidth += iconImg.width + iconSpace;
            if(negativeImage) boxWidth += hSpace + negativeImage.width;
            if(unitImg) boxWidth += unitImg.width;
            if(dotImage) boxWidth += hSpace + dotImage.width;
        }
        if(boxWidth === 0 || boxHeight === 0) return null;

        // Create canvas
        const tmp = runtime.newCanvas();
        tmp.width = boxWidth;
        tmp.height = boxHeight;
        const ctx = tmp.getContext("2d");

        // If no value and has invalidImage...
        if(valueMissing && invalidImage) {
            let px = TextImageWidget.getAlignOffsetX(config.align_h, tmp.width, invalidImage.width);
            ctx.drawImage(invalidImage, px, 0);
            return tmp;
        } else if(valueMissing) {
            text = "";
        }

        // Draw
        let px = TextImageWidget.getAlignOffsetX(config.align_h, tmp.width, fullWidth);

        function drawIfDefined(image) {
            if(image == null) return;
            ctx.drawImage(image, px, 0);
            px += image.width + hSpace;
        }

        drawIfDefined(iconImg);
        for(const liter of text) {
            switch (liter) {
                case "-":
                    drawIfDefined(negativeImage);
                    break;
                case ".":
                case ":":
                    drawIfDefined(dotImage);
                    break;
                case "u":
                    drawIfDefined(unitImg);
                    break;
                default:
                    if(!isNaN(parseInt(liter))) {
                        const img = await runtime.getAssetImage(config.font_array[parseInt(liter)]);
                        ctx.drawImage(img, px, 0);
                        px += basementImage.width + hSpace;
                    }
            }
        }

        return tmp;
    }

    async render(canvas, player) {
        const config = this.config;

        // Find text
        let text = "",
            maxLength = 0;

        // Fetch text
        if(config.text !== undefined) {
            text = config.text;
        } else if(config.type) {
            text = player.getDeviceState(config.type, "string");
            maxLength = player.getDeviceState(config.type, "maxLength");

            if(config.padding && text !== "") {
                const countNums = text.replace(/\D/g,'').length;
                text = text.padStart((maxLength - countNums) + text.length, "0");
            }
        }

        if(typeof text == "string") {
            if(text === "" && config.type === "ALARM_CLOCK" && !config.invalid_image) {
                text = "0";
            }
            if(text.indexOf(".") > -1 && !config.dot_image) {
                text = text.substring(0, text.lastIndexOf("."));
            }
        }

        if(text === null || text === undefined) {
            if(!this.failed) {
                console.warn("No text to display...");
                this.failed = true;
            }
            return;
        }

        // Render text
        let tmp;
        try {
            tmp = await TextImageWidget.draw(player, text, maxLength, config);
            if(tmp === null) return;
        } catch(e) {
            console.warn(e);
            return;
        }

        // Draw result
        canvas.getContext("2d").drawImage(tmp, config.x, config.y);
        super.dropEvents(player, [
            config.x, 
            config.y, 
            config.x + tmp.width,
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
        this.renderCounter = 0;
    }
    
    async render(canvas, player) {
        const config = this.config;
        player.refresh_required = "img_anim";

        if(config.anim_status === 0) return;

        let x = config.x, y = config.y;

        let currentFrame = Math.floor(this.renderCounter / 60 * config.anim_fps);
        if(player.animMaxFPS) {
            currentFrame = this.renderCounter;
        }

        if(config.repeat_count === 1) {
            currentFrame = Math.min(currentFrame, config.anim_size - 1);
        } else {
            currentFrame %= config.anim_size;
        }

        const path = config.anim_path + "/" + config.anim_prefix + "_" + currentFrame
            + "." + config.anim_ext;

        try {
            const img = await player.getAssetImage(path);
            canvas.getContext("2d").drawImage(img, x, y);
            super.dropEvents(player, [x, y, x + img.width, y + img.height]);
        } catch(e) {
            player.uiPause = true;
            throw e;
        }

        this.renderCounter++;
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
