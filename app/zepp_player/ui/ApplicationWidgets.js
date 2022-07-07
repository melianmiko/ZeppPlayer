import { BaseWidget } from "./BaseWidget.js";
import HuamiUIMock from "./HuamiUI.js";
import { MissingWidget } from "./ImagingWidgets.js";

/**
 * hmUI.widget.WIDGET_DELEGATE
 */
export class DelegateWidget extends BaseWidget {
    async render() {}
}

/**
 * hmUI.widget.GROUP
 */
export class GroupWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.widgets = [];
        config.__content = this.widgets;
    }

    async render(canvas, player) {
        const tempCanvas = player.newCanvas();
        tempCanvas.width = this.config.w;
        tempCanvas.height = this.config.h;

        for(let i in this.widgets) {
            const widget = this.widgets[i];
            widget.config.__eventOffsetX = this.config.x;
            widget.config.__eventOffsetY = this.config.y;
            await player.renderWidget(widget, tempCanvas);
        }

        canvas.getContext("2d").drawImage(tempCanvas, this.config.x, this.config.y);
        super.dropEvents(player, [
            this.config.x, 
            this.config.y,
            this.config.x + this.config.w,
            this.config.y + this.config.h
        ]);
    }

    createWidget(type, config) {
        let Widget;
        if(!type) {
            Widget = MissingWidget;
        } else {
            Widget = (new HuamiUIMock())._widget[type];
        }

        config.__player = this.config.__player;

        const i = new Widget(config);
        this.widgets.push(i);

        return i;
    }
}
