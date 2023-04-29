import AppSettingsManager from "../ui_managment/AppSettingsManager";
import ZeppPlayer from "../zepp_player/ZeppPlayer";
import {CSS_OPTIONS} from "./settings_pane/CssColorOptions";

export class PlayerSettingsLoader {
    static loadAll(player: ZeppPlayer) {
        // Load CSS colors
        for(const key in CSS_OPTIONS) {
            const value = AppSettingsManager.getString(`css_${key}`, null);
            console.log(key, value);
            if(value != null)
                document.documentElement.style.setProperty(`--${key}`, value);
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