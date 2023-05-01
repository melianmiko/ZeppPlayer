import {BaseWidget} from "../BaseWidget";
import ZeppRuntime from "../../ZeppRuntime";
import {CanvasContextEntry, CanvasEntry} from "../../types/EnvironmentTypes";
import {zeppColorToHex} from "../../Utils";
import {AddLineConfig, PolylineConfig} from "./types/PolylineWidgetTypes";

/**
 * hmUI.widget.GRADKIENT_POLYLINE
 */
export class PolylineWidget extends BaseWidget<PolylineConfig> {
    private canvas: CanvasEntry;
    private context: CanvasContextEntry;

    init() {
        this.canvas = this.runtime.newCanvas();
        this.canvas.width = this.config.w;
        this.canvas.height = this.config.h;

        this.context = this.canvas.getContext("2d");
        this.context.lineWidth = this.config.line_width ? this.config.line_width : 1;
        this.context.strokeStyle = zeppColorToHex(this.config.line_color);
    }

    clear() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.runtime.refresh_required = "polyline_canvas";
    }

    addLine(config: AddLineConfig) {
        const {data, count} = config;

        this.context.beginPath();
        this.context.moveTo(data[0].x, data[0].y);

        for(let i = 1; i < count; i++) {
            this.context.lineTo(data[i].x, data[i].y);
        }

        this.context.stroke();
        this.runtime.refresh_required = "polyline_canvas";
    }

    async render(canvas: CanvasEntry, runtime: ZeppRuntime) {
        canvas.getContext("2d").drawImage(this.canvas, this.config.x, this.config.y);

        this.dropEvents(runtime, [
            this.config.x,
            this.config.y,
            this.config.x + this.config.w,
            this.config.y + this.config.h
        ])
    }
}