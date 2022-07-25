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

/**
 * hmSensor
 * 
 * Fully implemented, but not tested =)
 */
 export default class HuamiSensorMock {
    constructor(player) {
        this._player = player;
    }

    createSensor(id) {
        return new id(this._player);
    }

    id = {
        TIME: TimeSensor,
        BATTERY: BatterySensor,
        STEP: StepSensor,
        CALORIE: CalorieSensor,
        HEART: HeartSensor,
        PAI: PaiSensor,
        DISTANCE: DistanceSensor,
        STAND: StandSensor,
        WEATHER: WeatherSensor,
        FAT_BURNING: FatBurningSensor,
        SPO2: SPO2Sensor,
        BODY_TEMP: BodyTempSensor,
        STRESS: StressSensor,
        VIBRATE: VibrateSensor,
        WEAR: WearSensor,
        WORLD_CLOCK: WorldClockSensor,
        SLEEP: SleepSensor,
        MUSIC: MusicSensor,
        ACTIVITY: ActivitySensor
    }

    event = {
        CHANGE: "CHANGE",
        CURRENT: "CURRENT",
        LAST: "LAST"
    }
}

/**
 * hmSensor.id.TIME
 */
 class TimeSensor {
    constructor(player) {
        this.player = player;

        // Fixed
        this.utc = Date.now();
        this.week = 2;
        this.lunar_day = this.day;
        this.lunar_month = this.month;
        this.lunar_solar_term = "ZeppPlayer";
        this.solar_festival = "New year";
    }

    get hour() {
        return this.player.getDeviceState("HOUR");
    }

    get minute() {
        return this.player.getDeviceState("MINUTE");
    }

    get second() {
        return this.player.getDeviceState("SECOND");
    }

    get day() {
        return this.player.getDeviceState("DAY");
    }

    get month() {
        return this.player.getDeviceState("MONTH");
    }
    
    get year() {
        return this.player.getDeviceState("YEAR") + 2000;
    }

    get format_hour() {
        return this.player.getDeviceState("HOUR");
    }

    getLunarMonthCalendar() {
        // todo
        return {lunar_days_array: [], day_count: 0};
    }

    getShowFestival() {
        return this.solar_festival;
    }
}

/**
 * hmSensor.id.BATTERY
 */
class BatterySensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("BATTERY");
    }

    addEventListener(name, callback) {
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("BATTERY", () => {
                this.current = this.player.getDeviceState("BATTERY");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.STEP
 */
class StepSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("STEP");
        this.target = player.getDeviceState("STEP_TARGET");
    }

    addEventListener(name, callback) {
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("STEP", () => {
                this.current = this.player.getDeviceState("STEP");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.CALORIE
 */
 class CalorieSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("CAL");
        this.target = player.getDeviceState("CAL_TARGET");
    }

    addEventListener(name, callback) {
        const player = this.player;
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("CAL", () => {
                this.current = this.player.getDeviceState("CAL");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.HEART
 */
class HeartSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("HEART");
        this.last = player.getDeviceState("HEART") * 1.1;
        this.today = [];

        for(let i = 0; i < 3600; i++) {
            this.today[i] = Math.round(90 + 90 * (i % 120)/120);
        }

        console.log(this.today);
    }

    addEventListener(name, callback) {
        const player = this.player;
        this.player.addDeviceStateChangeEvent("HEART", () => {
            this.current = this.player.getDeviceState("HEART");
            callback();
        });
    }
}

/**
 * hmSensor.id.PAI
 */
class PaiSensor {
    constructor(player) {
        this.dailypai = player.getDeviceState("PAI_DAILY");
        this.prepai0 = player.getDeviceState("PAI_DAILY") * 0.2;
        this.prepai1 = player.getDeviceState("PAI_DAILY") * 0.3;
        this.prepai2 = player.getDeviceState("PAI_DAILY") * 0.4;
        this.prepai3 = player.getDeviceState("PAI_DAILY") * 0.5;
        this.prepai4 = player.getDeviceState("PAI_DAILY") * 0.6;
        this.prepai5 = player.getDeviceState("PAI_DAILY") * 0.7;
        this.prepai6 = player.getDeviceState("PAI_DAILY") * 0.8;
        this.totalpai = this.prepai0 + this.prepai1 + this.prepai2 + 
            this.prepai3 + this.prepai4 + this.prepai5 + 
            this.prepai6 + this.dailypai;
    }
}

/**
 * hmSensor.id.DISTANCE
 */
 class DistanceSensor {
    constructor(player) {
        this.player = player;
        this.current = this.player.getDeviceState("DISTANCE");
    }

    addEventListener(name, callback) {
        const player = this.player;
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("DISTANCE", () => {
                this.current = this.player.getDeviceState("DISTANCE");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.STAND
 */
 class StandSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("STAND");
        this.target = player.getDeviceState("STAND_TARGET");
    }

    addEventListener(name, callback) {
        const player = this.player;
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("STAND", () => {
                this.current = this.player.getDeviceState("STAND");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.WEATHER
 */
class WeatherSensor {
    constructor(player) {
        this.player = player;
    }

    getForecastWeather() {
        return {
            cityName: "Barnaul",
            forecastData: {
                data: [
                    {high: 15, low: 12, index: 0},
                    {high: 10, low: 8, index: 1},
                    {high: 5, low: 2, index: 2},
                    {high: -1, low: -3, index: 3}
                ],
                count: 4
            },
            tideData: {
                data: [
                    {
                        sonrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sonrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sonrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sonrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    }
                ],
                count: 4
            }
        }
    }
}

/**
 * hmSensor.id.FAT_BURNING
 */
 class FatBurningSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("FAT_BURNING");
        this.target = player.getDeviceState("FAT_BURNING_TARGET");
    }

    addEventListener(name, callback) {
        const player = this.player;
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("FAT_BURNING", () => {
                this.current = this.player.getDeviceState("FAT_BURNING");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.SPO2
 */
class SPO2Sensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("SPO2");
        this.time = 0;
        this.hourAvgofDay = [];
        for(let i = 0; i < 24; i++) {
            this.hourAvgofDay.push(this.current);
        }
    }

    addEventListener(name, callback) {
        const player = this.player;
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("SPO2", () => {
                this.current = this.player.getDeviceState("SPO2");
                callback();
            });
        }
    }

    start() {
        console.log("[SPO2] start()");
    }
}

/**
 * hmSensor.id.BODY_TEMP
 */
class BodyTempSensor {
    constructor(player) {
        this.current = player.getDeviceState("BODY_TEMP");
        this.timeinterval = 10;
    }
}

/**
 * hmSensor.id.STRESS
 */
 class StressSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("STRESS");
        this.time = Date.now();
    }

    addEventListener(name, callback) {
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("STRESS", () => {
                this.current = this.player.getDeviceState("STRESS");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.VIBRATE
 */
class VibrateSensor {
    constructor() {
        this.motortype = 0;
        this.motorenable = 0;
        this.crowneffecton = 0;
        this.scene = 0;
    }

    start() {
        console.log("[VIBRATE] bzzzzzzz");
    }

    stop() {
        console.log("[VIBRATE] stop bzzzzz");
    }
}

/**
 * hmSensor.id.WEAR
 */
class WearSensor {
    constructor(player) {
        this.player = player;
        this.current = player.getDeviceState("WEAR_STATE");
    }

    addEventListener(name, callback) {
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("WEAR_STATE", () => {
                this.current = this.player.getDeviceState("WEAR_STATE");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.WORLD_CLOCK
 */
class WorldClockSensor {
    constructor(player) {
        this.player = player
    }

    init() {
        console.log("[WC] Init");
    }

    uninit() {
        console.log("[WC] unInit");
    }

    getWorldClockCount() {
        return 2;
    }

    getWorldClockInfo() {
        return {
            city: "Moscow",
            hour: this.player.gertDeviceState("HOUR") - 4,
            minute: this.player.gertDeviceState("MINUTE")
        }
    }
}

/**
 * hmSensor.id.SLEEP
 */
class SleepSensor {
    updateInfo() {
        console.log("[SLEEP] Fetching new info (really not)...");
    }

    getSleepStageData() {
        let out = [];
        for(let i = 0; i < 4; i++) out.push({
            model: i,
            start: i*60 + 22*60,
            stop: i*60 + 23*60
        });
    }

    getSleepStageModel() {
        return {
            WAKE_STAGE: 0,
            REM_STAGE: 1,
            LIGHT_STAGE: 2,
            DEEP_STAGE: 3
        }
    }
}

/**
 * hmSensor.id.MUSIC
 */
class MusicSensor {
    constructor(player) {
        this.player = player;
        this.title = this.player.getDeviceState("MUSIC_TITLE");
        this.artist = this.player.getDeviceState("MUSIC_ARTIST");
        this.isPlaying = this.player.getDeviceState("MUSIC_IS_PLAYING");
    }

    audInit() {}

    audPlay() {
        this.isPlaying = !this.isPlaying;
        this.player.setDeviceState("MUSIC_IS_PLAYING", this.isPlaying);
    }

    audPause() {
        this.audPlay();
    }

    audPrev() {
        console.log("[MUSIC] prev track");
    }

    audNext() {
        console.log("[MUSIC] next track");
    }

    addEventListener(name, callback) {
        if(name == "CHANGE") {
            this.player.addDeviceStateChangeEvent("MUSIC_TITLE", () => {
                this.title = this.player.getDeviceState("MUSIC_TITLE");
                callback();
            });
            this.player.addDeviceStateChangeEvent("MUSIC_ARTIST", () => {
                this.artist = this.player.getDeviceState("MUSIC_ARTIST");
                callback();
            });
            this.player.addDeviceStateChangeEvent("MUSIC_IS_PLAYING", () => {
                this.isPlaying = this.player.getDeviceState("MUSIC_IS_PLAYING");
                callback();
            });
        }
    }
}

/**
 * hmSensor.id.ACTIVITY
 * (no documentation)
 */
class ActivitySensor {
    constructor(player) {
        this.player = player;
    }

    getActivityInfo() {
        return {
            displayMode: 1
        }
    }
}