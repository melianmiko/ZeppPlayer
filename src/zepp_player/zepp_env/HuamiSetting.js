/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2022  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

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
        SETTINGS: 4,
        APP: 16
    }

    constructor(runtime) {
        this.runtime = runtime;
        this.store = [];

        for(let a in this.proped) {
            this.makeProped(...this.proped[a]);
        }
    }

    makeProped(getter, setter, def) {
        this.store[getter] = def;

        this[getter] = () => this.store[getter];
        if(setter !== "") this[setter] = (val) => {
            console.info("[hmSettings]", getter, "=", val);
            this.runtime.onConsole("hmSettings", [getter, "=", val]);
            this.store[getter] = val;
            return 0;
        };
    }

    getLanguage() {
        return this.runtime.language;
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
            width: this.runtime.screen[0],
            height: this.runtime.screen[1],
            screenShape: 1,
            deviceName: "ZeppPlayer",
            keyNumber: 0,
            deviceSource: 0
        }
    }

    getTimeFormat() {
        return this.runtime.getDeviceState("AM_PM") === "hide" ? 1 : 0;
    }

    getScreenType() {
        return this.runtime.showLevel;
    }

    getDateFormat() {
        return 0;
    }
}