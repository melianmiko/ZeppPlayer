import AppSettingsManager from "../ui_managment/AppSettingsManager";
import ZeppPlayer from "../zepp_player/ZeppPlayer";
import {CSS_OPTIONS} from "./settings_pane/CssColorOptions";
import { transformDidplaySize } from "./settings_pane/CssSettingsOption";

export class PlayerSettingsLoader {
    static loadAll(player: ZeppPlayer) {
        // Load CSS colors
        for(const key in CSS_OPTIONS) {
            const value = AppSettingsManager.getString(`css_${key}`, null);
            if(value != null)
                document.documentElement.style.setProperty(`--${key}`, value);
        }

        // Load display size
        const displaySize = AppSettingsManager.getString('css_display-size', null);
        if(displaySize != null) {
            document.documentElement.style.setProperty(`--display-size`, transformDidplaySize(displaySize));
        }

        // Load device state
        if(AppSettingsManager.getObject("cfgKeepState", true)) {
            try {
                const data = AppSettingsManager.getObject("deviceState", {});
                for(const type in data) {
                    player.setDeviceState(type, data[type]);
                }
            } catch(e) {
                console.warn(e);
            }
        }
    }
}