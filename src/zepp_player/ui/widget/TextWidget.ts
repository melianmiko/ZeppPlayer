import {BaseWidget} from "./BaseWidget";
import {zeppColorToHex} from "../../Utils";
import {TextToLines} from "../utils/TextToLines";
import {TextWidgetConfig} from "./types/TextWidgetTypes";
import ZeppRuntime from "../../ZeppRuntime";
import {CanvasEntry} from "../../types/EnvironmentTypes";

/**
 * hmUI.widget.TEXT
 */
export class TextWidget extends BaseWidget<TextWidgetConfig> {
    constructor(config: TextWidgetConfig) {
        super(config);
        config.alpha = undefined;
    }

    static drawText(userConfig: TextWidgetConfig, runtime: ZeppRuntime) {
        const config: TextWidgetConfig = {
            text_size: runtime.profileData.defaultFontSize || 18,
            color: 0x0,
            char_space: 0,
            line_space: 0,
            ...userConfig
        };

        let canvas = runtime.newCanvas();
        let context = canvas.getContext("2d");
        context.textBaseline = "top";
        context.font = `${config.text_size}px allfont`;

        // Split to lines
        const lines = TextToLines.perform(context, config);

        // Render each line
        let totalHeight = 0,
            px,
            maxWidth = 0;

        for (let i in lines) {
            let data = lines[i];

            let lineCanvas = runtime.newCanvas();
            let lineContext = lineCanvas.getContext("2d");
            lineContext.textBaseline = "top";
            lineContext.font = context.font;

            let sizes = lineContext.measureText(data);
            lineCanvas.width = sizes.width + config.char_space * data.length + 2;
            lineCanvas.height = config.text_size * 1.5;

            lineContext.textBaseline = "top";
            lineContext.fillStyle = zeppColorToHex(config.color);
            lineContext.font = context.font;

            px = 0;
            for (let j in data) {
                lineContext.fillText(data[j], px, config.text_size * 0.25);
                px += lineContext.measureText(data[j]).width + config.char_space;
            }

            lines[i] = lineCanvas;
            maxWidth = Math.max(maxWidth, lineCanvas.width);
            totalHeight += lineCanvas.height + config.line_space;
        }

        if (config._metricsOnly) return {
            height: totalHeight,
            width: maxWidth
        }

        // Build full image
        canvas.width = config.w ? config.w : maxWidth;
        canvas.height = config.h ? config.h : totalHeight;

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
                const progress = ((runtime.render_counter + 100) % 300) / 100;
                const w = maxWidth + config.w;
                if (progress < 1) px += (1 - progress) * w;
                else if (progress > 2) px -= (progress - 2) * w;
                runtime.refresh_required = "text_scroll";
            }

            context.drawImage(lineCanvas, px, py);
            py += lineCanvas.height + (config.line_space ? config.line_space : 0);
        }

        return canvas;
    }

    async render(canvas: CanvasEntry, runtime: ZeppRuntime) {
        const config = this.config;
        let width = config.w, height = config.h;
        if (config.text !== undefined && config.text !== "") {
            const text = await TextWidget.drawText(config, runtime);
            canvas.getContext("2d").drawImage(text, config.x, config.y);
            width = text.width;
            height = text.height;
        }

        this.dropEvents(runtime, [
            config.x,
            config.y,
            config.x + width,
            config.y + height
        ])
    }
}
