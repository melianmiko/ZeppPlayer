import {BaseWidget} from "../BaseWidget";
import {zeppColorToHex} from "../../Utils";
import {TextToLines} from "../utils/TextToLines";

/**
 * hmUI.widget.TEXT
 */
export class TextWidget extends BaseWidget {
    constructor(config) {
        super(config);
        config.alpha = undefined;
    }

    static drawText(config, player) {
        const textSize = config.text_size ? config.text_size : 18;
        const fontConf = textSize + "px allfont";
        const colorConf = config.color ? zeppColorToHex(config.color) : "#000";
        const offsetX = config.char_space ? config.char_space : 0;

        let canvas = player.newCanvas();
        let context = canvas.getContext("2d");
        context.textBaseline = "top";
        context.font = fontConf;

        // Split to lines
        const lines = TextToLines.perform(context, config);

        // Render each line
        let totalHeight = 0,
            px,
            maxWidth = 0;

        for (let i in lines) {
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
            for (let j in data) {
                lineContext.fillText(data[j], px, textSize * 0.25);
                px += lineContext.measureText(data[j]).width + offsetX;
            }

            lines[i] = lineCanvas;
            maxWidth = Math.max(maxWidth, lineCanvas.width);
            totalHeight += lineCanvas.height + (config.line_space ? config.line_space : 0);
        }

        if (config._metricsOnly) return {
            height: totalHeight,
            width: maxWidth
        }

        // Build full image
        canvas.width = config.w;
        canvas.height = config.h;
        if (!canvas.height) canvas.height = totalHeight;
        if (!canvas.width) canvas.width = maxWidth;

        let py = 0;
        if (config.align_v === "center_v") py = (canvas.height - totalHeight) / 2;
        if (config.align_v === "bottom") py = canvas.height - totalHeight;

        for (let i in lines) {
            let lineCanvas = lines[i];

            let px = 0;
            if (config.align_h === "center_h") px = Math.max(0, (config.w - lineCanvas.width) / 2);
            if (config.align_h === "right") px = Math.max(0, config.w - lineCanvas.width);

            if (!config.text_style && maxWidth > config.w) {
                // scroll
                const progress = ((player.render_counter + 100) % 300) / 100;
                const w = maxWidth + config.w;
                if (progress < 1) px += (1 - progress) * w;
                else if (progress > 2) px -= (progress - 2) * w;
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
        if (config.text) {
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