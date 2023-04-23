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

const LANG_VALUE_TABLE = [
    "zh-CN",
    "zh-TW",
    "en-US",
    "es-ES",
    "ru-RU",
    "ko-KR",
    "fr-FR",
    "de-DE",
    "id-ID",
    "pl-PL",
    "it-IT",
    "ja-JP",
    "th-TH",
    "ar-EG",
    "vi-VN",
    "pt-PT",
    "nl-NL",
    "tr-TR",
    "uk-UA",
    "iw-IL",
    "pt-BR",
    "ro-RO",
    "cs-CZ",
    "el-GR",
    "sr-RS",
    "ca-ES",
    "fi-FI",
    "nb-NO",
    "da-DK",
    "sv-SE",
    "hu-HU",
    "ms-MY",
    "sk-SK",
    "hi-IN"
];

export default class HuamiSettingMock {
    // Functions that will get/set prop
    // Will be generated in constructor
    mockedProperties = [
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

        for(let a in this.mockedProperties) {
            this._spawnMockedProperty(...this.mockedProperties[a]);
        }
    }

    _spawnMockedProperty(getter, setter, def) {
        this.store[getter] = def;

        this[getter] = () => this.store[getter];
        if(setter !== "") this[setter] = (val) => {
            console.info("[hmSettings]", getter, "=", val);
            this.runtime.onConsole("device", [setter, "=", val]);
            this.store[getter] = val;
            return 0;
        };
    }

    getLanguage() {
        if(LANG_VALUE_TABLE.indexOf(this.runtime.fullLanguage) < 0)
            return 2;

        return LANG_VALUE_TABLE.indexOf(this.runtime.fullLanguage);
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
            total: 103140000,
            free: 30130000,
            app: 1442000,
            watchface: 4350000,
            music: 0,
            system: 66900000
        }
    }

    getDeviceInfo() {
        return {
            width: this.runtime.profileData.screenWidth,
            height: this.runtime.profileData.screenHeight,
            screenShape: 1,
            deviceName: this.runtime.profileData.deviceName,
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