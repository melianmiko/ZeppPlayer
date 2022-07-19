import { PersistentStorage } from "../PersistentStorage.js";
import { BaseWidget } from "./BaseWidget.js";
import { ImageWidget } from "./ImagingWidgets.js";

export class EditableBackground extends BaseWidget {
    constructor(config) {
        super(config);
        this.player = config.__player;

        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(!config.current_type) config.current_type = config.default_id;

        this.addEventListener("onmouseup", () => {
            if(this.player.current_level != this.player.LEVEL_EDIT) return;
            this._switch();
        })
    }

    _findCurrent() {
        const id = this.config.current_type;
        for(var i in this.config.bg_config) {
            i = parseInt(i);
            if(this.config.bg_config[i].id == id) {
                return i;
            }
        }

        return this.config.default_id;
    }

    _switch() {
        const i = this._findCurrent();
        const nextIndex = (i + 1) % this.config.bg_config.length;
        const val = this.config.bg_config[nextIndex].id;
        PersistentStorage.set("wfEdit", this.config.edit_id, val);
        this.player.init();
    }

    async render(canvas, player) {
        const config = this.config;
        const data = this.config.bg_config[this._findCurrent()];

        if(this.player.current_level == this.player.LEVEL_EDIT) {
            const img = await player.getAssetImage(data.preview);
            const fg = await player.getAssetImage(config.fg);
            const tips = await player.getAssetImage(config.tips_bg);
            const eventsZone = ImageWidget.draw(img, canvas, config);
            ImageWidget.draw(fg, canvas, config);
            ImageWidget.draw(tips, canvas, {
                x: config.tips_x,
                y: config.tips_y
            });
            this.dropEvents(player, eventsZone);
        } else {
            const img = await player.getAssetImage(data.path);
            ImageWidget.draw(img, canvas, config);
        }
    }
}

export class EditGroupWidget extends BaseWidget {
    constructor(config) {
        super(config);
        this.player = config.__player;
        this._renderStage = "post";

        config.show_level = 4;
        config.current_type = PersistentStorage.get('wfEdit', config.edit_id);
        if(!config.current_type) config.current_type = config.default_type;

        this.addEventListener("onmouseup", () => {
            if(this.player.current_level != this.player.LEVEL_EDIT) return;
            this._switch();
        })
    }

    async render(canvas, player) {
        const config = this.config;
        const ctx = canvas.getContext("2d");

        const isActive = PersistentStorage.get("wfEdit", "focus") == config.edit_id
        const currentType = config.current_type;

        let preview = null;

        for(var i in config.optional_types) {
            const option = config.optional_types[i];
            if(option.type == currentType)
                preview = option.preview;
        }

        try {
            preview = await player.getAssetImage(preview);
            ctx.drawImage(preview, config.x, config.y);
        } catch(e) {
            // No preview, ignore
            preview = {width: config.w, height: config.h};
        }

        try {
            const overlay = await player.getAssetImage(
                isActive ? config.select_image : config.un_select_image);
            const dx = (overlay.width - preview.width) / 2;
            const dy = (overlay.height - preview.height) / 2;
            ctx.drawImage(overlay, config.x - dx, config.y - dy);
        } catch(e) {
            // No overlay, ignore
        }

        this.dropEvents(player, [
            config.x,
            config.y,
            config.x + preview.width,
            config.y + preview.height
        ])
    }

    _switch() {
        const currentType = this.config.current_type;
        for(var i in this.config.optional_types) {
            i = parseInt(i);
            if(this.config.optional_types[i].type == currentType) {
                // Get next
                const nextIndex = (i + 1) % this.config.optional_types.length;
                const val = this.config.optional_types[nextIndex];
                PersistentStorage.set("wfEdit", this.config.edit_id, val.type);
                PersistentStorage.set("wfEdit", "focus", this.config.edit_id);
                this.player.init();
                return;
            }
        }
    }
}
