import {BaseWidget} from "./BaseWidget";
import {FillRectWidget, TextWidget} from "./DrawingWidgets";
import {ImageWidget} from "./ImagingWidgets";

export class ScrollList extends BaseWidget {
    constructor(conf) {
        super(conf);
        this.scrollY = 0;
        this.isMouseDown = false;
        this.lastScrollY = 0;
        this.mouseStartEv = {};
        this.innerHeight = 0;

        this.addEventListener("onmouseup", (e) => this.eventUp(e));
        this.addEventListener("onmousedown", (e) => this.eventDown(e));
        this.addEventListener("onmousemove", (e) => this.eventMove(e));
    }

    async render(canvas, player) {
        const config = this.config;
        const view = player.newCanvas();
        view.width = config.w;
        view.height = config.h;

        let posY = this.scrollY;
        for(let i = 0; i < config.data_type_config_count; i++) {
            const dtc = config.data_type_config[i];
            const ic = this._getItemType(dtc.type_id);
            for(let j = dtc.start; j <= dtc.end; j++) {
                posY += await this._drawLine(ic, j, posY, view, player);
            }
        }

        this.innerHeight = posY - this.scrollY;

        canvas.getContext("2d").drawImage(view, config.x, config.y);
        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + config.w,
            config.y + config.h
        ])
    }

    _getItemType(type_id) {
        for(let i in this.config.item_config) {
            if(this.config.item_config[i].type_id === type_id)
                return this.config.item_config[i];
        }

        throw new Error("TypeID " + type_id + " missing");
    }

    async _drawLine(ic, index, posY, canvas, player) {
        const config = this.config;
        const item = config.data_array[index];
        const ctx = canvas.getContext("2d");

        // Bg
        FillRectWidget.draw(canvas, {
            x: 0,
            y: posY,
            w: config.w,
            h: ic.item_height,
            color: ic.item_bg_color,
            radius: ic.item_bg_radius
        }, "fill", player);

        for(let i = 0; i < ic.text_view_count; i++) {
            const tv = ic.text_view[i];
            const cnv = TextWidget.drawText({
                ...tv,
                text: item[tv.key],
                align_h: "center_h",
                align_v: "center_v"
            }, player)
            ctx.drawImage(cnv, tv.x, posY + tv.y);
        }

        for(let i = 0; i < ic.image_view_count; i++) {
            try {
                const iv = ic.image_view[i];
                const img = await player.getAssetImage(item[iv.key]);
                ImageWidget.draw(img, canvas, player, {
                    x: iv.x,
                    y: iv.y + posY
                })
            } catch(e) {}
        }

        return ic.item_height + config.item_space;
    }

    eventUp(e) {
        this.isMouseDown = false;

        if(this.lastScrollY === this.scrollY) {
            this.handleClick(e);
        }

        const lim = this.innerHeight - this.config.h;

        if(this.scrollY < -lim) this.scrollY = -lim;
        if(this.scrollY > 0) this.scrollY = 0;

        this.runtime.refresh_required = "scroll";
    }

    eventDown(e) {
        this.mouseStartEv = e;
        this.lastScrollY = this.scrollY;
        this.isMouseDown = true;
    }

    handleClick(e) {
        const config = this.config;
        const clickY = e.y - config.y;

        let posY = this.scrollY;
        for(let i = 0; i < config.data_type_config_count; i++) {
            const dtc = config.data_type_config[i];
            const ic = this._getItemType(dtc.type_id);
            for(let j = dtc.start; j <= dtc.end; j++) {
                if(clickY > posY && clickY < posY + ic.item_height) {
                    config.item_click_func(config.data_array, j);
                    return;
                }
                posY += ic.item_height + config.item_space;
            }
        }
    }

    eventMove(e) {
        if(!this.isMouseDown) return;
        if(Math.abs(e.y - this.mouseStartEv.y) < 5) return;

        const delta = e.y - this.mouseStartEv.y + this.lastScrollY;
        this.scrollY = delta;
        this.runtime.refresh_required = "scroll";
    }
}