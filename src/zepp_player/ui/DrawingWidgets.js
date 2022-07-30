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

import {BaseWidget} from "./BaseWidget.js";
import {zeppColorToHex} from "../Utils.js";
import {ImageWidget} from "./ImagingWidgets.js";

/**
 * hmUI.widget.TEXT
 */
export class TextWidget extends BaseWidget {
    static drawText(config, player) {
        const textSize = config.text_size ? config.text_size : 18;
        const fontConf = textSize + "px allfont";
        const colorConf = config.color ? zeppColorToHex(config.color) : "#000000";
        const offsetX = config.char_space ? config.char_space : 0;

        let canvas = player.newCanvas();
        let context = canvas.getContext("2d");
        context.textBaseline = "top";
        context.font = fontConf;
        
        // Split to lines
        let lines = [],
            preLines = config.text.toString().split("\n");

        let currentLine = -1,
            width,
            word,
            newLine,
            forceBreak;

        for(let i in preLines) {
            let data = preLines[i];
            currentLine++;

            if(!lines[currentLine]) lines[currentLine] = "";
            while(data !== "") {
                if (!lines[currentLine]) lines[currentLine] = "";
                if(config.text_style === 3) {
                    newLine = lines[currentLine] += data[0];
                    width = context.measureText(newLine).width + (offsetX * (newLine.length-1));
                    if(width < config.w - 20) {
                        lines[currentLine] += data[0];
                        data = data.substring(1);
                    } else {
                        lines[currentLine] += "..";
                        console.log(lines[currentLine])
                        data = "";
                    }
                } else if(config.text_style >= 1) {
                    forceBreak = false;
                    if(config.text_style === 2) {
                        // Per word
                        word = data.indexOf(" ") >= 0 ? data.substring(0, data.indexOf(" ") + 1) : data;
                    } else if(config.text_style === 1) {
                        // Per-symbol
                        word = data[0];
                    }
    
                    newLine = lines[currentLine] + word;
                    width = context.measureText(newLine).width + (offsetX * (newLine.length-1));
                    if((width < config.w || lines[currentLine].length === 0)) {
                        while(context.measureText(word).width > config.w) {
                            word = word.substring(0, word.length-1);
                        }
                        lines[currentLine] += word;
                        data = data.substring(word.length);
                    } else {
                        currentLine++;
                    }
                } else {
                    // No wrap
                    lines[currentLine] += data[0];
                    data = data.substring(1);
                }
            }
        }

        // Render each line
        let totalHeight = 0, px,
            maxWidth = 0;

        for(let i in lines) {
            let data = lines[i];

            let lineCanvas = player.newCanvas();
            let lineContext = lineCanvas.getContext("2d");
            lineContext.textBaseline = "top";
            lineContext.font = fontConf;

            let sizes = lineContext.measureText(data);
            lineCanvas.width = sizes.width + offsetX * data.length + 2;
            lineCanvas.height = textSize * 1.5;

            lineContext.textBaseline = "top";
            lineContext.fillStyle = colorConf;
            lineContext.font = fontConf;
            
            px = 0;
            for(let j in data) {
                lineContext.fillText(data[j], px, textSize * 0.25);
                px += lineContext.measureText(data[j]).width + offsetX;
            }

            lines[i] = lineCanvas;
            maxWidth = Math.max(maxWidth, lineCanvas.width);
            totalHeight += lineCanvas.height + (config.line_space ? config.line_space : 0);
        }

        if(config._metricsOnly) return {
            height: totalHeight,
            width: maxWidth
        }

        // Build full image
        canvas.width = config.w;
        canvas.height = config.h;
        if(!canvas.height) canvas.height = totalHeight;
        if(!canvas.width) canvas.width = maxWidth;

        let py = 0;
        if(config.align_v === "center_v") py = (canvas.height - totalHeight) / 2;
        if(config.align_v === "bottom") py = canvas.height - totalHeight;

        for(let i in lines) {
            let lineCanvas = lines[i];

            let px = 0;
            if(config.align_h === "center_h") px = Math.max(0, (config.w - lineCanvas.width) / 2);
            if(config.align_h === "right") px = Math.max(0, config.w - lineCanvas.width);

            if(!config.text_style && maxWidth > config.w) {
                // scroll
                const progress = ((player.render_counter+100) % 300) / 100;
                const w = maxWidth + config.w;
                if(progress < 1) px += (1-progress) * w;
                else if(progress > 2) px -= (progress-2) * w;
                player.refresh_required = "text_scroll";
            }

            context.drawImage(lineCanvas, px, py);
            py += lineCanvas.height + (config.line_space ? config.line_space : 0);
        }

        return canvas;
    }

    async render(canvas, player) {
        const config = this.config;
        let width = config.w, height = config.h;
        if(config.text) {
            const text = await TextWidget.drawText(config, player);
            canvas.getContext("2d").drawImage(text, config.x, config.y);
            width = text.width;
            height = text.height;
        }

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + width,
            config.y + height            
        ])
    }
}

/**
 * hmUI.widget.CIRCLE
 */
export class CircleWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = zeppColorToHex(config.color);
        ctx.beginPath();
        ctx.arc(config.center_x, config.center_y, config.radius, 0, Math.PI * 2);
        ctx.fill();
        this.dropEvents(player, [
            config.center_x - config.radius,
            config.center_y - config.radius,
            config.center_x + config.radius,
            config.center_y + config.radius
        ])
    }
}

/**
 * hmUI.widget.FILL_RECT
 */
export class FillRectWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.mode = "fill";
    }

    static draw(canvas, config, mode, player) {
        const img = player.newCanvas();
        img.width = config.w;
        img.height = config.h;

        const ctx = img.getContext("2d");
        const round = config.radius ? config.radius : 0;

        ctx.fillStyle = zeppColorToHex(config.color);
        ctx.strokeStyle = zeppColorToHex(config.color);
        ctx.lineWidth = config.line_width ? config.line_width : 1;


        // Ext. circle
        ctx.beginPath();
        FillRectWidget._makePath(ctx, config.w, config.h, 0, 0, round);
        ctx.fill();

        if(mode === "stroke") {
            ctx.beginPath();
            ctx.globalCompositeOperation = "destination-out";
            FillRectWidget._makePath(ctx,
                config.w - ctx.lineWidth*2,
                config.h - ctx.lineWidth*2,
                ctx.lineWidth,
                ctx.lineWidth,
                round - ctx.lineWidth);
            ctx.fill();
        }

        const rad = (config.angle % 180) / 180 * Math.PI;
        const b = Math.abs(config.w * Math.sin(rad)) + Math.abs(config.h * Math.cos(rad));
        const a = Math.abs(config.w * Math.cos(rad)) + Math.abs(config.h * Math.sin(rad));
        return ImageWidget.draw(img, canvas, player, {
            x: config.x,
            y: config.y,
            w: config.w,
            h: config.h,
            pos_x: (a - config.w) / 2,
            pos_y: (b - config.h) / 2,
            center_x: config.w / 2 + (a - config.w) / 2,
            center_y: config.h / 2 + (b - config.h) / 2,
            angle: config.angle
        });
    }

    static _makePath(ctx, w, h, x, y, round) {
        ctx.moveTo(x + round, y);
        ctx.lineTo(x + w - round, y);
        ctx.arc(x + w - round, y + round, round, 3*Math.PI / 2, 0);
        ctx.lineTo(x + w, y + h - round);
        ctx.arc(x + w - round, y + h - round, round, 0, Math.PI / 2);
        ctx.lineTo(x + round, y +h);
        ctx.arc(x + round, y + h - round, round, Math.PI/2, Math.PI);
        ctx.lineTo(x, y + round);
        ctx.arc(x + round, y + round, round, Math.PI, -Math.PI / 2);
    }

    async render(canvas, player) {
        const config = this.config;
        const box = FillRectWidget.draw(canvas, config, this.mode, player)
        this.dropEvents(player, box);
    }
}

export class StrokeRectWidget extends FillRectWidget {
    constructor(config) {
        super(config);
        this.mode = "stroke";
    }
}

/**
 * hmUI.widget.ARC_PROGRESS
 */
export class ArcProgressWidget extends BaseWidget {
    static draw(canvas, level, config) {
        const ctx = canvas.getContext("2d");
        const start = (-90 + config.start_angle) / 180 * Math.PI;
        const len = (config.end_angle - config.start_angle) * level;
        const end = (-90 + config.start_angle + len) / 180 * Math.PI;

        ctx.save();
        ctx.beginPath();

        ctx.lineWidth = config.line_width;
        ctx.strokeStyle = zeppColorToHex(config.color);
        ctx.lineCap = "round";
        
        ctx.arc(config.center_x, config.center_y, config.radius, start, end, config.end_angle - config.start_angle < 0);

        ctx.stroke();
        ctx.restore();
    }

    async render(canvas, player) {
        const config = this.config;
        if(config.color === undefined) return;
        
        let level = config.level / 100;
        if(config.type) level = player.getDeviceState(config.type, "progress");

        ArcProgressWidget.draw(canvas, level, config);
    }
}

/**
 * hmUI.widget.ARC
 */
export class ArcWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;
        if(!config.color) return;

        const radius = config.radius ? config.radius : config.w / 2;

        ArcProgressWidget.draw(canvas, 1, {
            center_x: config.x + radius,
            center_y: config.y + radius,
            color: config.color,
            line_width: config.line_width ? config.line_width : 1,
            radius: radius - (config.line_width ? config.line_width/2 : 1),
            start_angle: 90 + config.start_angle,
            end_angle: 90 + config.end_angle
        });
    }
}
