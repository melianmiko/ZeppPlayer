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
import {DeviceStateEntry} from "./device_state/DeviceStateEntry";

export function createDeviceState() {
    const stepTargetEntry = new NumberDeviceState({
        value: 9000,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 5,
        }
    });

    const calTargetEntry = new NumberDeviceState({
        value: 500,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
        }
    })

    const standTargetEntry = new NumberDeviceState({
        value: 13,
        displayConfig: {
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 2,
        }
    });

    const weatherIconEntry = new NumberDeviceState({
        value: 0,
        maxValue: 29,
        shiftStep: 1,
        displayConfig: {
            maxLength: 2,
            groupIcon: "sunny",
            displayName: "Icon",
        },
    })

    const fatBurningTarget = new NumberDeviceState({
        value: 20,
        displayConfig: {
            type: "number",
            maxLength: 3
        }
    })

    const state: {[key: string]: DeviceStateEntry<any>} = {
        HOUR: new NumberDeviceState({
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
        }),
        MINUTE: new NumberDeviceState({
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
        }),
        SECOND: new NumberDeviceState({
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
        }),
        DAY: new NumberDeviceState({
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
        }),
        MONTH: new NumberDeviceState({
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
                    return new Date().getMonth();
                return this.value;
            },
        }),
        YEAR: new NumberDeviceState({
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
        }),
        WEEKDAY: new NumberDeviceState({
            value: 0,
            shiftStep: 1,
            shiftTickCount: 2,
            maxValue: 7,
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
        }),
        AM_PM: new StringDeviceState({
            value: "hide",
            displayConfig: {
                type: "select",
                options: ["hide", "am", "pm"],
                groupIcon: "calendar_month",
                info: "AM/PM state: hide - 24h mode, am/pm - 12h mode",
                maxLength: 4,
            },
        }),
        OS_LANGUAGE: new StringDeviceState({
            value: "en-US",
            displayConfig: {
                type: "string",
                groupIcon: "settings",
                maxLength: 5,
            },
        }),
        OVERLAY_COLOR: new StringDeviceState({
            value: "#FFFFFF",
            displayConfig: {
                type: "string",
                groupIcon: "settings",
                maxLength: 7,
            }
        }),
        ALARM_CLOCK: new StringDeviceState({
            value: "09:30",
            displayConfig: {
                type: "string",
                groupIcon: "settings",
                maxLength: 4,
                options: ["0", "06:00", "09:30", "11:00"]
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
        }),
        BATTERY: new NumberDeviceState({
            value: 60,
            maxValue: 100,
            shiftStep: 10,
            displayConfig: {
                type: "number",
                groupIcon: "settings",
                maxLength: 3,
            },
        }),
        WEAR_STATE: new NumberDeviceState({
            value: 0,
            displayConfig: {
                groupIcon: "settings",
                displayName: "Wear",
                maxLength: 1
            }
        }),
        DISCONNECT: new BooleanDeviceState({
            value: true,
            displayConfig: {
                type: "boolean",
                groupIcon: "settings",
                maxLength: 1,
            }
        }),
        DISTURB: new BooleanDeviceState({
            value: true,
            displayConfig: {
                type: "boolean",
                groupIcon: "settings",
                maxLength: 1,
            }
        }),
        LOCK: new BooleanDeviceState({
            value: true,
            displayConfig: {
                type: "boolean",
                groupIcon: "settings",
                maxLength: 1,
            }
        }),
        STEP: new NumberDeviceState({
            value: 4500,
            shiftStep: 500,
            get maxValue() {
                return stepTargetEntry.value;
            },
            displayConfig: {
                type: "number",
                groupIcon: "fitness_center",
                maxLength: 5,
            },
            getProgress(): number {
                return this.value / stepTargetEntry.value;
            },
        }),
        STEP_TARGET: stepTargetEntry,
        DISTANCE: new NumberDeviceState({
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
        }),
        CAL: new NumberDeviceState({
            value: 320,
            shiftStep: 30,
            get maxValue() {
                return calTargetEntry.value;
            },
            displayConfig: {
                type: "number",
                groupIcon: "fitness_center",
                maxLength: 4,
            },
            getProgress(): number {
                return this.value / calTargetEntry.value;
            }
        }),
        CAL_TARGET: calTargetEntry,
        STAND: new NumberDeviceState({
            value: 12,
            shiftStep: 1,
            get maxValue() {
                return standTargetEntry.value;
            },
            displayConfig: {
                type: "number",
                maxLength: 2,
                groupIcon: "fitness_center",
            },
            getProgress(): number {
                return this.value / standTargetEntry.value;
            },
            getString(): string {
                return  this.value + "." + standTargetEntry.value;
            },
        }),
        STAND_TARGET: standTargetEntry,
        HEART: new NumberDeviceState({
            value: 99,
            shiftStep: 15,
            maxValue: 180,
            displayConfig: {
                type: "number",
                groupIcon: "monitor_heart",
                maxLength: 3,
            }
        }),
        SLEEP: new StringDeviceState({
            value: "9:0",
            displayConfig: {
                type: "string",
                groupIcon: "monitor_heart",
                maxLength: 5,
                options: ["0", "06:00", "09:30", "11:00"]
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
        }),
        SPO2: new NumberDeviceState({
            value: 30,
            maxValue: 100,
            shiftStep: 2,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "monitor_heart",
            }
        }),
        PAI_WEEKLY: new NumberDeviceState({
            value: 55,
            maxValue: 100,
            shiftStep: 4,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "monitor_heart",
            }
        }),
        PAI_DAILY: new NumberDeviceState({
            value: 80,
            maxValue: 100,
            shiftStep: 4,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "monitor_heart",
            }
        }),
        STRESS: new NumberDeviceState({
            value: 50,
            maxValue: 100,
            shiftStep: 5,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "monitor_heart",
            }
        }),
        WEATHER_CURRENT: new NumberDeviceState({
            value: 12,
            displayConfig: {
                type: "number",
                groupIcon: "sunny",
                displayName: "Current",
                maxLength: 2,
            },
            getProgress(player: ZeppPlayer): number {
                return weatherIconEntry.getProgress(player);
            },
            performShift(tick: number) {
                this.value = (Math.abs(this.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1);
            }
        }),
        WEATHER_HIGH: new NumberDeviceState({
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
        }),
        WEATHER_LOW: new NumberDeviceState({
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
        }),
        WEATHER_CURRENT_ICON: weatherIconEntry,
        WEATHER_CITY: new StringDeviceState({
            value: "Barnaul",
            displayConfig: {
                type: "string",
                maxLength: 15,
                groupIcon: "sunny",
                displayName: "City name",
            }
        }),
        WIND: new NumberDeviceState({
            value: 2,
            maxValue: 16,
            displayConfig: {
                type: "number",
                maxLength: 2,
                groupIcon: "sunny",
            }
        }),
        AQI: new NumberDeviceState({
            value: 20,
            maxValue: 100,
            shiftStep: 5,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "sunny",
            }
        }),
        HUMIDITY: new NumberDeviceState({
            value: 10,
            maxValue: 100,
            shiftStep: 8,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "sunny",
            }
        }),
        ALTIMETER: new NumberDeviceState({
            value: 0,
            maxValue: 100,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "sunny",
            }
        }),
        WIND_DIRECTION: new NumberDeviceState({
            value: 0,
            maxValue: 7,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "sunny",
            }
        }),
        UVI: new NumberDeviceState({
            value: 10,
            maxValue: 100,
            shiftStep: 5,
            displayConfig: {
                type: "number",
                maxLength: 3,
                groupIcon: "sunny",
            }
        }),
        MUSIC_IS_PLAYING: new BooleanDeviceState({
            value: true,
            displayConfig: {
                type: "boolean",
                groupIcon: "music_note",
                maxLength: 1,
            }
        }),
        MUSIC_ARTIST: new StringDeviceState({
            value: "Crusher-P",
            displayConfig: {
                groupIcon: "music_note",
                type: "string",
                maxLength: 8
            }
        }),
        MUSIC_TITLE: new StringDeviceState({
            value: "ECHO",
            displayConfig: {
                groupIcon: "music_note",
                type: "string",
                maxLength: 12
            }
        }),
        STOP_WATCH: new StringDeviceState({
            value: "-",
            displayConfig: {
                maxLength: 5,
                type: "string",
                groupIcon: "apps",
            }
        }),
        COUNT_DOWN: new StringDeviceState({
            value: "-",
            displayConfig: {
                maxLength: 5,
                type: "string",
                groupIcon: "apps",
            }
        }),
        FAT_BURNING: new NumberDeviceState({
            value: 0,
            displayConfig: {
                type: "number",
                maxLength: 3,
            },
            getProgress: () => this.value / fatBurningTarget.value,
        }),
        FAT_BURNING_TARGET: fatBurningTarget,
        BODY_TEMP: new NumberDeviceState({
            value: 36.5,
            maxValue: 45,
            displayConfig: {
                type: "number",
                maxLength: 4,
            },
            getString: () => {
                const km = Math.floor(this.value).toString(),
                    dm = Math.round((this.value % 1) * 100).toString();
                return km.padStart(2, "0") + "." + dm.padStart(1, "0");
            },
        }),
        MOON: new NumberDeviceState({
            value: 0,
            maxValue: 7,
            displayConfig: {
                maxLength: 1,
                type: "number",
            },
        }),
        SUN_CURRENT: new StringDeviceState({
            value: "",
            displayConfig: {
                notEditable: true,
                maxLength: 5,
            },
            getString: () => {
                const current = state.HOUR.value + (state.MINUTE.value / 100);
                if(current <= 6.30 || current >= 21.30) {
                    return state.SUN_RISE.value;
                }
                return state.SUN_SET.value;
            },
        }),
        SUN_SET: new StringDeviceState({
            value: "21.30",
            displayConfig: {
                notEditable: true,
                maxLength: 5,
            }
        }),
        SUN_RISE: new StringDeviceState({
            value: "06:30",
            displayConfig: {
                notEditable: true,
                maxLength: 5,
            }
        }),
    };

    return state;
}
