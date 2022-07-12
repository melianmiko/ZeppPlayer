import { zeppColorToHex } from "../Utils.js";
import { BaseWidget } from "./BaseWidget.js";
import { FillRectWidget, TextWidget } from "./DrawingWidgets.js";
import { ImageWidget } from "./ImagingWidgets.js";

export class ButtonWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.pressed = false;

        this.addEventListener("onmousedown", () => {
            this.pressed = true;
            config.__player.refresh_required = "button"; // we changed color/bg
        });
        this.addEventListener("onmouseup", () => {
            this.pressed = false;
            config.__player.refresh_required = "button"; // we changed color/bg
            if(config.click_func) config.click_func();
        });
    }

    async render(canvas, player) {
        const config = this.config;
        const w = config.w ? config.w : 0;
        const h = config.h ? config.h : 0;

        if(config.press_src && config.normal_src) {
            // Img bg
            const src = this.pressed ? config.press_src : config.normal_src;
            const img = await player.getAssetImage(src);
            ImageWidget.draw(img, canvas, {
                x: config.x + Math.max(0, (w - img.width) / 2),
                y: config.y + Math.max(0, (h - img.height) / 2)
            });
        } else {
            const normalColor = config.normal_color ? zeppColorToHex(config.normal_color) : "#111111";
            const pressedColor = config.press_color ? zeppColorToHex(config.press_color) : "#1f1f1f";
            const color = this.pressed ? pressedColor : normalColor;

            FillRectWidget.draw(canvas, {
                ...config,
                color: color
            }, "fill", player);
        }

        const textLayer = await TextWidget.drawText({
            ...config,
            align_h: "center_h",
            align_v: "center_v",
            color: config.color !== undefined ? config.color : 0xffffff,
            text_style: 1
        }, player);
        canvas.getContext("2d").drawImage(textLayer, config.x, config.y);

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + config.w,
            config.y + config.h
        ])
    }
}