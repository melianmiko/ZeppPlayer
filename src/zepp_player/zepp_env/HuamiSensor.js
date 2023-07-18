// noinspection JSUnusedGlobalSymbols

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

import {ZeppNotImplementedError} from "../Errors";

/**
 * hmSensor
 * 
 * Fully implemented, but not tested =)
 */
 export default class HuamiSensorMock {
    constructor(runtime) {
        this._runtime = runtime;
    }

    createSensor(id) {
        if(id === undefined) throw new ZeppNotImplementedError(`hmSensor.id.?`)
        return new id(this._runtime);
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
        FAT_BURRING: FatBurningSensor,
        SPO2: SPO2Sensor,
        BODY_TEMP: BodyTempSensor,
        STRESS: StressSensor,
        VIBRATE: VibrateSensor,
        WEAR: WearSensor,
        WORLD_CLOCK: WorldClockSensor,
        SLEEP: SleepSensor,
        MUSIC: MusicSensor,
        ACTIVITY: ActivitySensor,
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
    event = {
        MINUTEEND: "MINUTEEND",
        DAYCHANGE: "DAYCHANGE"
    }

    constructor(player) {
        this.player = player;

        // Fixed
        this.lunar_day = this.day;
        this.lunar_month = this.month;
        this.lunar_solar_term = "ZeppPlayer";
        this.solar_festival = "New year";
    }

    addEventListener(name, callback) {
        if(name === "MINUTEEND") {
            this.player.addDeviceStateChangeEvent("HOUR", () => {
                callback();
            });
            this.player.addDeviceStateChangeEvent("MINUTE", () => {
                callback();
            });
        } else if(name === "DAYCHANGE") {
            this.player.addDeviceStateChangeEvent("DAY", () => {
                callback();
            });
            this.player.addDeviceStateChangeEvent("MONTH", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }

    get utc() {
        return Date.now();
    }

    get week() {
        return this.player.getDeviceState("WEEKDAY") + 1;
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
    get current() {
        return this.player.getDeviceState("BATTERY");
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("BATTERY", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }
}

/**
 * hmSensor.id.STEP
 */
class StepSensor {
    get target() {
        return this.player.getDeviceState("STEP_TARGET");
    }

    get current() {
        return this.player.getDeviceState("STEP");
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("STEP", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
       this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }
}

/**
 * hmSensor.id.CALORIE
 */
 class CalorieSensor {
    get current() {
        return this.player.getDeviceState("CAL");
    }

    get target() {
        return this.player.getDeviceState("CAL_TARGET");
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("CAL", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }
}

/**
 * hmSensor.id.HEART
 */
class HeartSensor {
    event = {
        CURRENT: "CHANGE",
        LAST: "LAST"
    }

    get current() {
        return this.player.getDeviceState("HEART");
    }

    get last() {
        return this.player.getDeviceState("HEART");
    }
    
    constructor(player) {
        this.player = player;
        this.today = [];
        this._eventCallbacks = [];

        this.player.onStateChanged.add((e) => {
            if(e === "HEART") for(const fn of this._eventCallbacks)
                fn();
        })

        for(let i = 0; i < 3600; i++) {
            this.today[i] = Math.round(90 + 90 * (i % 120)/120);
        }
    }

    removeEventListener(name, callback) {
        this._eventCallbacks.splice(this._eventCallbacks.indexOf(callback), 1);
    }

    addEventListener(name, callback) {
        this._eventCallbacks.push(callback);
    }
}

/**
 * hmSensor.id.PAI
 */
class PaiSensor {
    constructor(player) {
        this.player = player;
    }

    get totalpai() {
        return this.player.getDeviceState("PAI_WEEKLY");
    }

    get dailypai() {return this.player.getDeviceState("PAI_DAILY");}
    get prepai0() {return this.player.getDeviceState("PAI_DAILY") * 0.2;}
    get prepai1() {return this.player.getDeviceState("PAI_DAILY") * 0.3;}
    get prepai2() {return this.player.getDeviceState("PAI_DAILY") * 0.4;}
    get prepai3() {return this.player.getDeviceState("PAI_DAILY") * 0.5;}
    get prepai4() {return this.player.getDeviceState("PAI_DAILY") * 0.6;}
    get prepai5() {return this.player.getDeviceState("PAI_DAILY") * 0.7;}
    get prepai6() {return this.player.getDeviceState("PAI_DAILY") * 0.8;}

    addEventListener(name, callback) {}
}

/**
 * hmSensor.id.DISTANCE
 */
 class DistanceSensor {
    get current() {
        return this.player.getDeviceState("DISTANCE") * 1000;
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("DISTANCE", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }
}

/**
 * hmSensor.id.STAND
 */
 class StandSensor {
    get target() {
        return this.player.getDeviceState("STAND_TARGET");
    }

    get current() {
        return this.player.getDeviceState("STAND");
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("STAND", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
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
            cityName: this.player.getDeviceState("WEATHER_CITY", "string"),
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
                        sunrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sunrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sunrise: {hour: 9, minute: 30},
                        sunset: {hour: 21, minute: 30}
                    },
                    {
                        sunrise: {hour: 9, minute: 30},
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
    get target() {
        return this.player.getDeviceState("FAT_BURNING_TARGET");
    }

    get current() {
        return this.player.getDeviceState("FAT_BURNING");
    }

    constructor(player) {
        this.player = player;
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("FAT_BURNING", () => {
                callback();
            });
        }
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }
}

/**
 * hmSensor.id.SPO2
 */
class SPO2Sensor {
    get current() {
        return this.player.getDeviceState("SPO2");
    }

    constructor(player) {
        this.player = player;
        this.time = 0;
        this.hourAvgofDay = [];
        for(let i = 0; i < 24; i++) {
            this.hourAvgofDay.push(this.current);
        }
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("SPO2", () => {
                callback();
            });
        }
    }

    start() {
        console.log("[SPO2] start()");
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
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
    get current() {
        return this.player.getDeviceState("STRESS");
    }

    constructor(player) {
        this.player = player;
        this.time = Date.now();
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("STRESS", () => {
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
        console.log("[VIBRATE] start");
    }

    stop() {
        console.log("[VIBRATE] stop");
    }
}

/**
 * hmSensor.id.WEAR
 */
class WearSensor {
    get current() {
        return this.player.getDeviceState("WEAR_STATE");
    }

    constructor(player) {
        this.player = player;
    }

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("WEAR_STATE", () => {
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
        this.player = player;
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
            hour: this.player.getDeviceState("HOUR") - 4,
            minute: this.player.getDeviceState("MINUTE")
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
        const out = [];

        for(let i = 0; i < 4; i++) out.push({
            model: i,
            start: i*60 + 22*60,
            stop: i*60 + 23*60
        });

        return out;
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
    get title() {
        return this.player.getDeviceState("MUSIC_TITLE");
    }

    get artist() {
        return this.player.getDeviceState("MUSIC_ARTIST");
    }

    get isPlaying() {
        return this.player.getDeviceState("MUSIC_IS_PLAYING");
    }

    constructor(player) {
        this.player = player;
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

    removeEventListener(_) {
        this.player.onConsole("ZeppPlayer", ["Sensor removeEventList not implemented, sorry"]);
    }

    addEventListener(name, callback) {
        if(name === "CHANGE") {
            this.player.addDeviceStateChangeEvent("MUSIC_TITLE", () => {
                callback();
            });
            this.player.addDeviceStateChangeEvent("MUSIC_ARTIST", () => {
                callback();
            });
            this.player.addDeviceStateChangeEvent("MUSIC_IS_PLAYING", () => {
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
