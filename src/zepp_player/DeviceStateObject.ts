// noinspection JSPotentiallyInvalidUsageOfThis

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

import ZeppPlayer from "./ZeppPlayer";
import {NumberDeviceState} from "./device_state/NumberDeviceState";
import {StringDeviceState} from "./device_state/StringDeviceState";
import {BooleanDeviceState} from "./device_state/BooleanDeviceState";
import {SelectDeviceState} from "./device_state/SelectDeviceState";

export class DeviceState {
    STEP_TARGET = new NumberDeviceState({
        value: 9000,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 5,
        }
    });

    CAL_TARGET = new NumberDeviceState({
        value: 500,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
        }
    });

    STAND_TARGET = new NumberDeviceState({
        value: 13,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 2,
        }
    });

    WEATHER_CURRENT_ICON = new NumberDeviceState({
        value: 0,
        maxValue: 29,
        shiftStep: 1,
        displayConfig: {
            maxLength: 2,
            groupIcon: "sunny",
            displayName: "Icon",
        },
    })

    FAT_BURNING_TARGET = new NumberDeviceState({
        value: 20,
        displayConfig: {
            type: "number",
            maxLength: 3
        }
    });

    HOUR = new NumberDeviceState({
        value: 9,
        maxValue: 12,
        shiftTickCount: 2,
        shiftStep: 1,
        displayConfig: {
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 0, // not required
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getHours();
            return this.value;
        },
    });

    MINUTE = new NumberDeviceState({
        value: 30,
        maxValue: 60,
        shiftStep: 5,
        displayConfig: {
            type: "number",
            maxLength: 0, // not required
            groupIcon: "calendar_month",
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getMinutes();
            return this.value;
        },
    });

    SECOND = new NumberDeviceState({
        value: 45,
        maxValue: 60,
        shiftStep: 1,
        displayConfig: {
            type: "number",
            maxLength: 0, // not required
            groupIcon: "calendar_month",
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getSeconds();
            return this.value;
        },
    });

    DAY = new NumberDeviceState({
        value: 25,
        maxValue: 31,
        shiftStep: 1,
        displayConfig: {
            type: "number",
            maxLength: 2,
            groupIcon: "calendar_month",
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getDate();
            return this.value;
        },
    });

    MONTH = new NumberDeviceState({
        value: 7,
        maxValue: 12,
        shiftStep: 1,
        shiftTickCount: 2,
        displayConfig: {
            type: "number",
            maxLength: 2,
            groupIcon: "calendar_month",
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getMonth() + 1;
            return this.value;
        },
    });

    YEAR = new NumberDeviceState({
        value: 22,
        shiftStep: 0,
        displayConfig: {
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 2,
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return new Date().getFullYear() % 2000;
            return this.value;
        },
    });

    WEEKDAY = new NumberDeviceState({
        value: 0,
        shiftStep: 1,
        shiftTickCount: 2,
        maxValue: 6,
        displayConfig: {
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 1,
        },
        getNumber(player: ZeppPlayer): number {
            if(player.config.enableRTC)
                return (new Date().getDay() + 6) % 7;
            return this.value;
        },
    });

    AM_PM = new SelectDeviceState({
        value: "hide",
        options: ["hide", "am", "pm"],
        displayConfig: {
            groupIcon: "calendar_month",
            info: "AM/PM state: hide - 24h mode, am/pm - 12h mode",
            maxLength: 4,
        },
    });

    OS_LANGUAGE = new StringDeviceState({
        value: "en-US",
        displayConfig: {
            groupIcon: "settings",
            maxLength: 5,
        },
    });

    OVERLAY_COLOR = new StringDeviceState({
        value: "#FFFFFF",
        displayConfig: {
            groupIcon: "settings",
            maxLength: 7,
        }
    });

    ALARM_CLOCK = new StringDeviceState({
        value: "09:30",
        shiftOptions: ["0", "06:00", "09:30", "11:00"],
        displayConfig: {
            groupIcon: "settings",
            maxLength: 4
        },
        getBoolean(): boolean {
            return this.value !== "0";
        },
        getString(): string {
            return this.value.replaceAll(":", ".")
        },
        getProgress(): number {
            try {
                const v = this.value.split(":");
                const float = (parseInt(v[0]) + (parseInt(v[1]) / 100));
                return Math.min(1 , float / 24);
            } catch(e) {
                return 0;
            }
        },
    });

    BATTERY = new NumberDeviceState({
        value: 60,
        maxValue: 100,
        shiftStep: 10,
        displayConfig: {
            type: "number",
            groupIcon: "settings",
            maxLength: 3,
        },
    });

    WEAR_STATE = new NumberDeviceState({
        value: 0,
        displayConfig: {
            groupIcon: "settings",
            displayName: "Wear",
            maxLength: 1
        }
    });

    DISCONNECT = new BooleanDeviceState({
        value: true,
        displayConfig: {
            groupIcon: "settings",
            maxLength: 1,
        }
    });

    DISTURB = new BooleanDeviceState({
        value: true,
        displayConfig: {
            groupIcon: "settings",
            maxLength: 1,
        }
    });

    LOCK = new BooleanDeviceState({
        value: true,
        displayConfig: {
            groupIcon: "settings",
            maxLength: 1,
        }
    });

    STEP = new NumberDeviceState({
        value: 4500,
        shiftStep: 500,
        get maxValue(): number {
            return this.fetchMaxValue();
        },
        fetchMaxValue: () => {
            return this.STEP_TARGET.value;
        },
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 5,
        },
        getProgress: () => {
            return this.STEP.value / this.STEP_TARGET.value;
        },
    });

    DISTANCE = new NumberDeviceState({
        value: 1.5,
        shiftStep: 0.75,
        maxValue: 20,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
        },
        getString() {
            return this.getNumber().toFixed(2);
        },
    });

    CAL = new NumberDeviceState({
        value: 320,
        shiftStep: 30,
        get maxValue(): number {
            return this.fetchMaxValue();
        },
        fetchMaxValue: () => {
            return this.CAL_TARGET.value;
        },
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
        },
        getProgress: () => {
            return this.CAL.value / this.CAL_TARGET.value;
        }
    });

    STAND: NumberDeviceState = new NumberDeviceState({
        value: 12,
        shiftStep: 1,
        get maxValue(): number {
            return this.fetchMaxValue();
        },
        fetchMaxValue: () => {
            return this.STAND_TARGET.value;
        },
        displayConfig: {
            type: "number",
            maxLength: 2,
            groupIcon: "fitness_center",
        },
        getProgress: () => {
            return this.STAND.value / this.STAND_TARGET.value;
        },
        getString: () => {
            return  `${this.STAND.value}.${this.STAND_TARGET.value}`;
        },
    });

    HEART = new NumberDeviceState({
        value: 99,
        shiftStep: 15,
        maxValue: 180,
        displayConfig: {
            type: "number",
            groupIcon: "monitor_heart",
            maxLength: 3,
        }
    });

    SLEEP = new StringDeviceState({
        value: "9:0",
        shiftOptions: ["0", "06:00", "09:30", "11:00"],
        displayConfig: {
            groupIcon: "monitor_heart",
            maxLength: 5,
        },
        getBoolean(): boolean {
            return this.value != "0";
        },
        getProgress(): number {
            try {
                const v = this.value.split(":");
                const float = (parseInt(v[0]) + (parseInt(v[1]) / 100));
                return Math.min(1 , float / 24);
            } catch(e) {
                return 0;
            }
        }
    });

    SPO2 = new NumberDeviceState({
        value: 30,
        maxValue: 100,
        shiftStep: 2,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
        }
    });

    PAI_WEEKLY = new NumberDeviceState({
        value: 55,
        maxValue: 100,
        shiftStep: 4,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
        }
    });

    PAI_DAILY = new NumberDeviceState({
        value: 80,
        maxValue: 100,
        shiftStep: 4,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
        }
    });

    STRESS = new NumberDeviceState({
        value: 50,
        maxValue: 100,
        shiftStep: 5,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
        }
    });

    WEATHER_CURRENT = new NumberDeviceState({
        value: 12,
        displayConfig: {
            type: "number",
            groupIcon: "sunny",
            displayName: "Current",
            maxLength: 2,
        },
        getProgress: (player: ZeppPlayer) => {
            return this.WEATHER_CURRENT_ICON.getProgress(player);
        },
        performShift(tick: number) {
            this.value = (Math.abs(this.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1);
        }
    });

    WEATHER_HIGH = new NumberDeviceState({
        value: 24,
        displayConfig: {
            type: "number",
            groupIcon: "sunny",
            displayName: "High",
            maxLength: 2,
        },
        performShift(tick: number) {
            this.value = (Math.abs(this.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1);
        }
    });

    WEATHER_LOW = new NumberDeviceState({
        value: 14,
        displayConfig: {
            type: "number",
            groupIcon: "sunny",
            displayName: "Low",
            maxLength: 2,
        },
        performShift(tick: number) {
            this.value = (Math.abs(this.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1);
        }
    });

    WEATHER_CITY = new StringDeviceState({
        value: "Barnaul",
        displayConfig: {
            maxLength: 15,
            groupIcon: "sunny",
            displayName: "City name",
        }
    });

    WIND = new NumberDeviceState({
        value: 2,
        maxValue: 16,
        displayConfig: {
            type: "number",
            maxLength: 2,
            groupIcon: "sunny",
        }
    });

    AQI = new NumberDeviceState({
        value: 20,
        maxValue: 100,
        shiftStep: 5,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
        }
    });

    HUMIDITY = new NumberDeviceState({
        value: 10,
        maxValue: 100,
        shiftStep: 8,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
        }
    });

    ALTIMETER = new NumberDeviceState({
        value: 0,
        maxValue: 1064,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
        }
    });

    WIND_DIRECTION = new NumberDeviceState({
        value: 0,
        maxValue: 7,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
        }
    });

    UVI = new NumberDeviceState({
        value: 10,
        maxValue: 100,
        shiftStep: 5,
        displayConfig: {
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
        }
    });

    MUSIC_IS_PLAYING = new BooleanDeviceState({
        value: true,
        displayConfig: {
            groupIcon: "music_note",
            maxLength: 1,
        }
    });

    MUSIC_ARTIST = new StringDeviceState({
        value: "Crusher-P",
        displayConfig: {
            groupIcon: "music_note",
            maxLength: 8
        }
    });

    MUSIC_TITLE = new StringDeviceState({
        value: "ECHO",
        displayConfig: {
            groupIcon: "music_note",
            maxLength: 12
        }
    });

    STOP_WATCH = new StringDeviceState({
        value: "-",
        displayConfig: {
            maxLength: 5,
            groupIcon: "apps",
        }
    });

    COUNT_DOWN = new StringDeviceState({
        value: "-",
        displayConfig: {
            maxLength: 5,
            groupIcon: "apps",
        }
    });

    FAT_BURNING: NumberDeviceState = new NumberDeviceState({
        value: 0,
        displayConfig: {
            type: "number",
            maxLength: 3,
        },
        getProgress: () => this.FAT_BURNING.value / this.FAT_BURNING_TARGET.value,
    });

    BODY_TEMP = new NumberDeviceState({
        value: 36.5,
        maxValue: 45,
        displayConfig: {
            type: "number",
            maxLength: 4,
        },
        getString: () => {
            const km: string = Math.floor(this.BODY_TEMP.value).toString(),
                dm: string = Math.round((this.BODY_TEMP.value % 1) * 100).toString();
            return km.padStart(2, "0") + "." + dm.padStart(1, "0");
        },
    });

    MOON = new NumberDeviceState({
        value: 0,
        maxValue: 7,
        displayConfig: {
            maxLength: 1,
            type: "number",
        },
    });

    SUN_CURRENT = new StringDeviceState({
        value: "",
        displayConfig: {
            notEditable: true,
            maxLength: 5,
        },
        getString: () => {
            const current = this.HOUR.value + (this.MINUTE.value / 100);
            if(current <= 6.30 || current >= 21.30) {
                return this.SUN_RISE.value;
            }
            return this.SUN_SET.value;
        },
        getProgress: (): number => {
            let current = this.HOUR.value + (this.MINUTE.value / 100);
            current = Math.max(0, current - parseFloat(this.SUN_RISE.value));
            return current / parseFloat(this.SUN_SET.value);
        }
    });

    SUN_SET = new StringDeviceState({
        value: "21.30",
        displayConfig: {
            notEditable: true,
            maxLength: 5,
        }
    });

    SUN_RISE = new StringDeviceState({
        value: "06.30",
        displayConfig: {
            notEditable: true,
            maxLength: 5,
        }
    });
}
