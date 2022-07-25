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
import { zeppColorToHex } from "../Utils.js";
import { ImageWidget } from "./ImagingWidgets.js";

/**
 * hmUI.widget.TEXT
 */
export class TextWidget extends BaseWidget {
    static async drawText(config, player) {
        const textSize = config.text_size ? config.text_size : 22;
        const fontConf = textSize + "px sans";
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
                if(!lines[currentLine]) lines[currentLine] = "";
                if(config.text_style >= 1) {
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
                        lines[currentLine] += word;
                        data = data.substring(word.length);
                    } else {
                        lines[currentLine] = lines[currentLine].trim();
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
        let maxWidth = config.w ? config.w : 0, 
            maxHeight = config.h ? config.h : 0,
            totalHeight = 0, px;

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
                lineContext.fillText(data[j], px, 0);
                px += lineContext.measureText(data[j]).width + offsetX;
            }

            lines[i] = lineCanvas;
            maxWidth = Math.max(maxWidth, lineCanvas.width);
            maxHeight = Math.max(maxHeight, lineCanvas.height);
            totalHeight += lineCanvas.height + (config.line_space ? config.line_space : 0);
        }

        totalHeight -= textSize*0.5; // remove last offset after line

        // Build full image
        canvas.width = maxWidth;
        canvas.height = maxHeight;

        let py = 0;
        if(config.align_v === "center_v") py = (canvas.height - totalHeight) / 2;
        if(config.align_v === "bottom") py = canvas.height - totalHeight;

        for(let i in lines) {
            let lineCanvas = lines[i];

            let px = 0;
            if(config.align_h === "center_h") px = (maxWidth - lineCanvas.width) / 2;
            if(config.align_h === "right") px = maxWidth - lineCanvas.width;

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

        ctx.beginPath();

        ctx.moveTo(round, 0);
        ctx.lineTo(config.w - round, 0);
        ctx.arc(config.w - round, round, round, 3*Math.PI / 2, 0);

        // ctx.moveTo(config.w, round);
        ctx.lineTo(config.w, config.h - round);
        ctx.arc(config.w - round, config.h - round, round, 0, Math.PI / 2);

        // ctx.moveTo(config.w - round, config.h);
        ctx.lineTo(round, config.h);
        ctx.arc(round, config.h - round, round, Math.PI/2, Math.PI);

        // ctx.moveTo(0, config.h - round);
        ctx.lineTo(0, round);
        ctx.arc(round, round, round, Math.PI, -Math.PI / 2);

        ctx[mode]();

        // canvas.getContext("2d").drawImage(img, 0, 0);
        const box = ImageWidget.draw(img, canvas, {
            pos_x: config.x,
            pos_y: config.y,
            center_x: config.x + img.width / 2,
            center_y: config.y + img.height / 2,
            angle: config.angle
        });

        return box;
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