export default class HuamiSettingMock {
    // Functions that will get/set prop
    // Will be generated in constructor
    proped = [
        // [get, set, default]
        ["getScreenAutoBright", "setScreenAutoBright", true],
        ["getBrightness", "setBrightness", 90],
        ["setBrightScreenCancel", "setBrightScreen", 0],
        ["setScreenOff", "", true],
        ["getMileageUnit", "", 0],
        ["getDateFormat", "", 0],
        ["getWeightTarget", "", 50.5],
        ["getSleepTarget", "", 8 * 60],
        ["getWeightUnit", "", 0]
    ]

    screen_type = {
        WATCHFACE: 1,
        AOD: 2,
        SETTINGS: 8,
        APP: 16
    }

    constructor(player) {
        this.player = player;
        this.store = [];

        for(var a in this.proped) {
            this.makeProped(...this.proped[a]);
        }
    }

    makeProped(getter, setter, def) {
        this.store[getter] = def;

        this[getter] = () => this.store[getter];
        if(setter !== "") this[setter] = (val) => {
            console.info("[hmSettings]", getter, "=", val);
            this.player.onConsole("hmSettings", [getter, "=", val]);
            this.store[getter] = val;
        };
    }

    getLanguage() {
        return this.player.language;
    }

    getUserData() {
        return {
            age: 20,
            height: 180,
            weight: 55.5,
            gender: 0,
            nickName: "NotARobot",
            region: "ru"
        }
    }

    getDiskInfo() {
        return {
            total: 128 * 1024 * 1024,
            free: 47 * 1024 * 1024,
            app: 1.1 * 1024 * 1024,
            watchface: 12.5 * 1024 * 1024,
            music: 0,
            system: 48 * 1024 * 1024
        }
    }

    getDeviceInfo() {
        return {
            width: this.player.screen[0],
            height: this.player.screen[1],
            screenShape: 1,
            deviceName: "ZeppPlayer",
            keyNumber: 0,
            deviceSource: 0
        }
    }

    getTimeFormat() {
        return this.player.getDeviceState("AM_PM") == "hide" ? 1 : 0;
    }

    getScreenType() {
        return this.player.current_level;
    }

    getDateFormat() {
        return 0;
    }
}