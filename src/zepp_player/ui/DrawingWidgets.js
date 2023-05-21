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

import {BaseWidget} from "./widget/BaseWidget.ts";
import {zeppColorToHex} from "../Utils.js";
import {ImageWidget} from "./ImagingWidgets.js";

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
        config.alpha = undefined;
    }

    static draw(canvas, config, mode, player) {
        const img = player.newCanvas();
        img.width = config.w;
        img.height = config.h;

        const ctx = img.getContext("2d");
        const color = config.color ? config.color : 0;

       const round = Math.floor(Math.min(config.radius ? config.radius : 0,
            Math.abs(config.h) / 2,
            Math.abs(config.w) / 2));

        ctx.fillStyle = zeppColorToHex(color);
        ctx.strokeStyle = zeppColorToHex(color);
        ctx.lineWidth = config.line_width ? config.line_width : 1;

        // Ext. circle
        ctx.beginPath();
        FillRectWidget._makePath(ctx, config.w, config.h, 0, 0, round);
        ctx.fill();

        if(mode === "stroke") {
            ctx.beginPath();
            ctx.globalCompositeOperation = "destination-out";
            // noinspection JSSuspiciousNameCombination
            FillRectWidget._makePath(ctx,
                config.w - ctx.lineWidth*2,
                config.h - ctx.lineWidth*2,
                ctx.lineWidth,
                ctx.lineWidth,
                Math.max(0, round - ctx.lineWidth));
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
        ctx.lineTo(x + round, y + h);
        ctx.arc(x + round, y + h - round, round, Math.PI/2, Math.PI);
        ctx.lineTo(x, y + round);
        ctx.arc(x + round, y + round, round, Math.PI, -Math.PI / 2);
    }

    async render(canvas, player) {
        const config = this.config;
        config.w = Math.round(config.w);
        config.h = Math.round(config.h);

        if(config.w === 0 || config.h === 0) return;
        const box = FillRectWidget.draw(canvas, config, this.mode, player)
        this.dropEvents(player, box);
    }
}

export class StrokeRectWidget extends FillRectWidget {
    constructor(config) {
        super(config);
        this.mode = "stroke";
        config.alpha = undefined;
    }
}

/**
 * hmUI.widget.ARC_PROGRESS
 */
export class ArcProgressWidget extends BaseWidget {
    static draw(canvas, level, config) {
        // Fuck geometry...
        const len = (config.end_angle - config.start_angle) * level;
        if(len === 0) return;

        const ctx = canvas.getContext("2d");
        const width = config.line_width ? config.line_width : 1;
        const direction = config.end_angle - config.start_angle < 0;

        ctx.save();

        ctx.lineWidth = width;
        ctx.strokeStyle = zeppColorToHex(config.color);

        const dN = (90 * width) / (Math.PI * config.radius) * (config.start_angle < config.end_angle ? -1 : 1);
        const isLargerThanDot = Math.abs(config.radius * len / 180 * Math.PI) > width;

        const cornerFlag = Math.abs(len) >= 360 ? 3 : config.corner_flag;
        const withStartCornerRound = [direction ? 1 : 2, 3].indexOf(cornerFlag) === -1;
        const withEndCornerRound = [direction ? 2 : 1, 3].indexOf(cornerFlag) === -1 && isLargerThanDot

        const getRadian = (len) => (-90 + config.start_angle + len) / 180 * Math.PI
        const drawArc = (start, end) => {
            ctx.beginPath();
            ctx.arc(config.center_x, config.center_y, config.radius,
                getRadian(start), getRadian(end), direction)
            ctx.stroke();
        };

        // Draw all as one ARC
        drawArc(withStartCornerRound ? -dN : 0,
            isLargerThanDot ? len + (withEndCornerRound ? dN : 0) : -dN)

        // Round start/end, if required
        ctx.lineCap = "round";
        if(withStartCornerRound) drawArc(-dN, -dN);
        if(withEndCornerRound) drawArc(len + dN, len + dN);

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
