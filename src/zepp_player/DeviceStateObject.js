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

export function createDeviceState() {
    const state = {
        HOUR: {
            value: 9,
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 0, // not required
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 12,
            shift: (tick) => tick % 2 === 0 ? (state.HOUR.value + 1) % 24 : null
        },
        MINUTE: {
            value: 30,
            type: "number",
            maxLength: 0, // not required
            groupIcon: "calendar_month",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 60,
            shift: () => (state.MINUTE.value + 5) % 60
        },
        SECOND: {
            value: 45,
            type: "number",
            maxLength: 0, // not required
            groupIcon: "calendar_month",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 60,
            shift: () => (state.SECOND.value + 1) % 60
        },
        DAY: {
            value: 25,
            type: "number",
            maxLength: 2,
            groupIcon: "calendar_month",
            getString: (t) => t.value.toString(),
            getProgress: (t) => (t.value % 31) / 31,
            shift: () => (state.DAY.value % 30) + 1
        },
        MONTH: {
            value: 7,
            type: "number",
            maxLength: 2,
            groupIcon: "calendar_month",
            getString: (t) => t.value.toString(),
            getProgress: (t) => (t.value % 12) / 12,
            shift: (tick) => tick % 2 === 0 ? state.MONTH.value % 12 + 1 : null
        },
        YEAR: {
            value: 22,
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 2,
            getString: (t) => t.value.toString()
        },
        WEEKDAY: {
            value: 0,
            type: "number",
            groupIcon: "calendar_month",
            maxLength: 1,
            getString: (t) => t.value.toString(),
            getProgress: (t) => (t.value+1) / 7,
            shift: (tick) => tick % 2 === 0 ? (state.WEEKDAY.value + 1) % 7 : null
        },
        AM_PM: {
            value: "hide",
            type: "select",
            options: ["hide", "am", "pm"],
            groupIcon: "calendar_month",
            info: "AM/PM state: hide - 24h mode, am/pm - 12h mode",
            maxLength: 4,
            getString: (t) => t.value,
            shift: () => {
                if(state.AM_PM === "hidden") return "am";
                if(state.AM_PM === "am") return "pm";
                return "hidden";
            }
        },
        OS_LANGUAGE: {
            value: "en-US",
            type: "string",
            groupIcon: "settings",
            maxLength: 5,
            getString: (t) => t.value
        },
        OVERLAY_COLOR: {
            value: "#FFFFFF",
            type: "string",
            groupIcon: "settings",
            maxLength: 7,
            getString: (t) => t.value
        },
        ALARM_CLOCK: {
            value: "09:30",
            type: "string",
            groupIcon: "settings",
            maxLength: 4,
            getBoolean: (v) => v.value !== "0",
            getString: (t) => t.value.replaceAll(":", "."),
            getProgress: (t) => {
                try {
                    const v = t.value.split(":");
                    const float = (parseInt(v[0]) + (parseInt(v[1]) / 100));
                    return Math.min(1 , float / 24);
                } catch(e) {
                    return 0;
                }
            },
            shift: (tick, t) => {
                if(tick % 2 !== 0) return null;
                const vals = ["0", "06:00", "09:30", "11:00"];
                let index = vals.indexOf(t.value);
                if(index < 0) index = 0;
                return vals[(index + 1) % vals.length];
            }
        },
        BATTERY: {
            value: 60,
            type: "number",
            groupIcon: "settings",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: (_, t) => (t.value) % 100 + 10
        },
        WEAR_STATE: {
            value: 0,
            groupIcon: "settings",
            displayName: "Wear",
            info: "Wear state: 0 - Not worn, 1 - Wearing, 2 - In motion, 3 - not sure"
        },
        DISCONNECT: {
            value: true,
            type: "boolean",
            groupIcon: "settings",
            maxLength: 1,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 === 1 ? !t.value : null
        },
        DISTURB: {
            value: true,
            type: "boolean",
            groupIcon: "settings",
            maxLength: 1,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 === 2 ? !t.value : null
        },
        LOCK: {
            value: true,
            type: "boolean",
            groupIcon: "settings",
            maxLength: 1,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 === 0 ? !t.value : null
        },
        STEP: {
            value: 4500,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 5,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.STEP_TARGET.value,
            shift: (_, t) => (t.value + 500) % state.STEP_TARGET.value
        },
        STEP_TARGET: {
            value: 9000,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 5,
            getString: (t) => t.value.toString()
        },
        DISTANCE: {
            value: 1.5,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
            getString: (t) => {
                return t.value.toFixed(2);
            },
            shift: () => (state.DISTANCE.value + 0.75) % 20
        },
        CAL: {
            value: 320,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.CAL_TARGET.value,
            shift: (_, t) => (t.value + 30) % state.CAL_TARGET.value
        },
        CAL_TARGET: {
            value: 500,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 4,
            getString: (t) => t.value.toString()
        },
        STAND: {
            value: 12,
            type: "number",
            maxLength: 2,
            groupIcon: "fitness_center",
            getString: (t) => {
                return  t.value + "." + state.STAND_TARGET.value;
            },
            getProgress: (t) => t.value / state.STAND_TARGET.value,
            shift: (tick) => tick % 2 === 0 ? state.STAND.value % state.STAND_TARGET.value + 1 : null
        },
        STAND_TARGET: {
            value: 13,
            type: "number",
            groupIcon: "fitness_center",
            maxLength: 2,
            getString: (t) => t.value.toString()
        },
        HEART: {
            value: 99,
            type: "number",
            groupIcon: "monitor_heart",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 180,
            shift: () => (state.HEART.value + 15) % 180
        },
        SLEEP: {
            value: "9:0",
            type: "string",
            groupIcon: "monitor_heart",
            maxLength: 5,
            getBoolean: (v) => v.value !== "0",
            getString: (t) => t.value,
            getProgress: (t) => {
                try {
                    const v = t.value.split(":");
                    const float = (parseInt(v[0]) + (parseInt(v[1]) / 100));
                    return Math.min(1 , float / 24);
                } catch(e) {
                    return 0;
                }
            },
            shift: (tick, t) => {
                if(tick % 2 !== 0) return null;
                const vals = ["0", "06:00", "09:30", "11:00"];
                let index = vals.indexOf(t.value);
                if(index < 0) index = 0;
                return vals[index + 1 % vals.length];
            }
        },
        SPO2: {
            value: 30,
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => (state.SPO2.value + 2 % 100)
        },
        PAI_WEEKLY: {
            value: 55,
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: (tick) => tick % 3 == 0 ? state.PAI_WEEKLY.value % 100 + 4 : null
        },
        PAI_DAILY: {
            value: 80,
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.PAI_DAILY.value % 100 + 4
        },
        STRESS: {
            value: 50,
            type: "number",
            maxLength: 3,
            groupIcon: "monitor_heart",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.STRESS.value % 100 + 5
        },
        WEATHER_CURRENT: {
            value: 12,
            type: "number",
            groupIcon: "sunny",
            displayName: "Current",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            getProgress: () => state.WEATHER_CURRENT_ICON.value / 28,
            shift: (tick, t) => (Math.abs(t.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1)
        },
        WEATHER_HIGH: {
            value: 14,
            type: "number",
            groupIcon: "sunny",
            displayName: "High",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            shift: (tick, t) => (Math.abs(t.value) + 2) % 30
        },
        WEATHER_LOW: {
            value: 14,
            type: "number",
            groupIcon: "sunny",
            displayName: "Low",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            shift: (tick, t) => (Math.abs(t.value) + 2) % 15 * (tick % 4 < 2 ? -1 : 1)
        },
        WEATHER_CURRENT_ICON: {
            value: 0,
            maxLength: 2,
            groupIcon: "sunny",
            displayName: "Icon",
            shift: () => (state.WEATHER_CURRENT_ICON.value + 1) % 29
        },
        WEATHER_CITY: {
            value: "Barnaul",
            type: "string",
            maxLength: 15,
            groupIcon: "sunny",
            displayName: "City name",
            getString: (t) => t.value
        },
        WIND: {
            value: 2,
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.HUMIDITY.value % 16 + 1
        },
        AQI: {
            value: 20,
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.HUMIDITY.value % 100 + 5
        },
        HUMIDITY: {
            value: 10,
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.HUMIDITY.value % 92 + 8
        },
        ALTIMETER: {
            value: 0,
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100
        },
        WIND_DIRECTION: {
            value: 0,
            type: "number",
            maxLength: 3,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100
        },
        UVI: {
            value: 10,
            type: "number",
            maxLength: 2,
            groupIcon: "sunny",
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.UVI.value % 100 + 5
        },
        MUSIC_IS_PLAYING: {
            value: true,
            type: "boolean",
            groupIcon: "music_note",
            maxLength: 1,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 === 0 ? !t.value : null
        },
        MUSIC_ARTIST: {
            value: "Crusher-P",
            groupIcon: "music_note",
            type: "string",
            maxLength: 8 // UI align
        },
        MUSIC_TITLE: {
            value: "ECHO",
            groupIcon: "music_note",
            type: "string",
            maxLength: 12 // UI align
        },
        FAT_BURNING: {
            value: 0,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.FAT_BURNING_TARGET.value,
            shift: () => (state.FAT_BURNING.value + 1) % state.FAT_BURNING_TARGET.value
        },
        FAT_BURNING_TARGET: {
            value: 20,
            type: "number",
            maxLength: 3
        },
        BODY_TEMP: {
            value: 36.5,
            type: "number",
            maxLength: 4,  // with dot
            getString: (t) => {
                const km = Math.floor(t.value).toString(),
                    dm = Math.round((t.value % 1) * 100).toString();
                return km.padStart(2, "0") + "." + dm.padStart(1, "0");
            },
            getProgress: (t) => t.value / 45
        },
        SUN_CURRENT: { // ???
            value: 0,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: () => state.HOUR.value / 24
        },
        MOON: { // ???
            getProgress: () => 0.3
        },
        SUN_SET: {
            value: "21.30",
            notEditable: true,
            getString: (t) => t.value
        },
        SUN_RISE: {
            value: "06.30",
            notEditable: true,
            getString: (t) => t.value
        }
    };

    return state;
}
