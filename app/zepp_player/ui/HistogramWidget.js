import { zeppColorToHex } from "../Utils.js";
import { BaseWidget } from "./BaseWidget.js";
import { TextWidget } from "./DrawingWidgets.js";

/**
 * hmUI.widget.HISTOGRAM
 */
export class HistogramWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;
        const internalCanvas = player.newCanvas();

        console.log(config);

        internalCanvas.width = config.w;
        internalCanvas.height = config.h;

        await this.drawBg(internalCanvas, player);
        await this.drawData(internalCanvas, player);

        canvas.getContext("2d").drawImage(internalCanvas, config.x, config.y);
        this.dropEvents([
            config.x,
            config.y,
            config.x + config.w,
            config.y + config.h
        ])
    }

    async drawData(canvas, player) {
        const config = this.config;
        const ctx = canvas.getContext("2d");
        const height = config.item_max_height ? config.item_max_height : config.h;
        const dataHeight = config.data_max_value - config.data_min_value;
        ctx.fillStyle = zeppColorToHex(config.item_color);

        let x = 0;
        for(let i = 0; i < config.data_count; i++) {
            const perc = Math.max(0, config.data_array[i] - config.data_min_value) / dataHeight;
            const lineHeight = perc * height;

            ctx.fillRect(x, height - lineHeight, config.item_width, lineHeight);
            x += config.item_width + config.item_space
        }
    }

    async drawBg(canvas, player) {
        const ctx = canvas.getContext("2d");

        // xline
        const xline = this.config.xline;

        ctx.strokeStyle = zeppColorToHex(xline.color !== undefined ? xline.color : 0xffffff);
        ctx.lineWidth = xline.width ? xline.width : 1;

        let x = xline.pading;
        while(x < canvas.width) {
            ctx.beginPath();
            ctx.moveTo(x, xline.start);
            ctx.lineTo(x, xline.end);
            ctx.stroke();
            x += xline.space;
        }

        // yline
        const yline = this.config.yline;

        ctx.strokeStyle = zeppColorToHex(yline.color !== undefined ? yline.color : 0xffffff);
        ctx.lineWidth = yline.width ? yline.width : 1;

        let y = yline.pading;
        while(y < canvas.height) {
            ctx.beginPath();
            ctx.moveTo(yline.start, y);
            ctx.lineTo(yline.end, y);
            ctx.stroke();
            y += yline.space
        }

        // xText
        const xText = this.config.xText;
        for(let i = 0; i < xText.count; i++) {
            let cw = await TextWidget.drawText({
                text: xText.data_array[i],
                align_h: xText.align,
                color: xText.color,
                w: xText.w,
                h: xText.h,
                text_size: 18
            }, player);
            ctx.drawImage(cw, xText.x + ((xText.space + xText.w)*i), xText.y);
        }

        // yText
        const yText = this.config.yText;
        for(let i = 0; i < yText.count; i++) {
            let cw = await TextWidget.drawText({
                text: yText.data_array[i],
                align_h: yText.align,
                color: yText.color,
                w: yText.w,
                h: yText.h,
                text_size: 18
            }, player);
            ctx.drawImage(cw, yText.x, yText.y + ((yText.space + yText.h)*i));
        }
    }
}