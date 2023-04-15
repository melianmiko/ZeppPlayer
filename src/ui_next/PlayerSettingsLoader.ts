import AppSettingsManager from "../ui_managment/AppSettingsManager";
import ZeppPlayer from "../zepp_player/ZeppPlayer";

export class PlayerSettingsLoader {
    static loadAll(player: ZeppPlayer) {
        PlayerSettingsLoader.loadProps(player);
    }

    static loadProps(player: ZeppPlayer) {
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