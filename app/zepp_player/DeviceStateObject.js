export function createDeviceState() {
    const state = {
        ALARM_CLOCK: {
            value: "09:30",
            type: "string",
            floatVal: () => {
                try {
                    const v = state.ALARM_CLOCK.value.split(":");
                    return parseInt(v[0]) + (parseInt(v[1]) / 100);
                } catch(e) { return 0; }
            },
            mkString: (v) => {
                return Math.round(v).toString().padStart(2, "0") + ":" +
                    Math.round(v % 1 * 100).toString().padStart(2, "0")
            },
            getProgress: () => Math.min(1, state.ALARM_CLOCK.floatVal() / 24)
        },
        DISCONNECT: {
            value: false,
            type: "boolean",
            getProgress: () => state.DISCONNECT.value ? 1 : 0,
            shift: (tick) => tick % 3 == 0 ? !state.DISCONNECT.value : null
        },
        DISTURB: {
            value: true,
            type: "boolean",
            getProgress: () => state.DISTURB.value ? 1 : 0,
            shift: (tick) => tick % 2 == 0 ? !state.DISTURB.value : null
        },
        LOCK: {
            value: true,
            type: "boolean",
            getProgress: () => state.LOCK.value ? 1 : 0,
            shift: (tick) => tick % 3 == 0 ? !state.LOCK.value : null
        },
        STEP: {
            value: 4500,
            getProgress: () => state.STEP.value / state.STEP_TARGET.value,
            shift: () => (state.STEP.value + 500) % state.STEP_TARGET.value
        },
        STEP_TARGET: {
            value: 9000
        },
        DISTANCE: {
            value: 1.5,
            shift: () => (state.DISTANCE.value + 0.5) % 20
        },
        HEART: {
            value: 99,
            getProgress: () => state.HEART.value / 180,
            shift: () => (state.HEART.value + 15) % 180
        },
        CAL: {
            value: 320,
            getProgress: () => state.CAL.value / state.CAL_TARGET.value,
            shift: () => (state.CAL.value + 30) % state.CAL_TARGET.value
        },
        CAL_TARGET: {
            value: 500
        },
        BATTERY: {
            value: 60,
            getProgress: () => state.BATTERY.value / 100,
            shift: () => (state.BATTERY.value) % 100 + 10
        },
        WEEKDAY: {
            value: 0,
            getProgress: () => state.WEEKDAY.value / 6,
            shift: (tick) => tick % 2 == 0 ? (state.WEEKDAY.value + 1) % 7 : null
        },
        HOUR: {
            value: 9,
            getProgress: () => state.HOUR.value / 12,
            shift: (tick) => tick % 2 == 0 ? (state.HOUR.value + 1) % 24 : null
        },
        MINUTE: {
            value: 30,
            getProgress: () => state.MINUTE.value / 60,
            shift: () => (state.MINUTE.value + 5) % 60
        },
        SECOND: {
            value: 45,
            getProgress: () => state.SECOND.value / 60,
            shift: () => (state.SECOND.value + 1) % 60
        },
        DAY: {
            value: 15,
            getProgress: () => state.DAY.value / 31,
            shift: () => (state.DAY.value + 1) % 31
        },
        MONTH: {
            value: 9,
            getProgress: () => state.MONTH.value / 12,
            shift: (tick) => tick % 2 == 0 ? state.MONTH.value % 12 + 1 : null
        },
        STAND: {
            value: 12,
            getProgress: () => state.STAND.value / state.STAND_TARGET.value,
            shift: (tick) => tick % 2 == 0 ? state.STAND.value % state.STAND_TARGET.value + 1 : null
        },
        STAND_TARGET: {
            value: 13
        },
        YEAR: {
            value: 2022
        },
        AM_PM: {
            value: "hide",
            type: "string",
            info: "AM/PM state: hide - 24h mode, am/pm - 12h mode",
            shift: () => {
                if(state.AM_PM == "hidden") return "am";
                if(state.AM_PM == "am") return "pm";
                return "hidden";
            }
        },
        PAI_WEEKLY: {
            value: 55,
            getProgress: () => state.PAI_WEEKLY.value / 100,
            shift: (tick) => tick % 3 == 0 ? state.PAI_WEEKLY.value % 100 + 4 : null
        },
        PAI_DAILY: {
            value: 80,
            getProgress: () => state.PAI_DAILY.value / 100,
            shift: () => state.PAI_DAILY.value % 100 + 4
        },
        WEATHER_CURRENT_ICON: {
            value: 0,
            shift: () => (state.WEATHER_CURRENT_ICON.value + 1) % 29
        },
        WEATHER_CURRENT: {
            value: 12,
            getProgress: () => state.WEATHER_CURRENT_ICON.value / 29
        },
        HUMIDITY: {
            value: 10,
            getProgress: () => state.HUMIDITY.value / 100,
            shift: () => state.HUMIDITY.value % 92 + 8
        },
        UVI: {
            value: 10,
            getProgress: () => state.UVI.value / 100,
            shift: () => state.UVI.value % 100 + 5
        },
        STRESS: {
            value: 50,
            getProgress: () => state.STRESS.value / 200,
            shift: () => state.STRESS.value % 100 + 5
        },
        FAT_BURNING: {
            value: 0,
            getProgress: () => state.FAT_BURNING.value / state.FAT_BURNING_TARGET.value,
            shift: () => (state.FAT_BURNING.value + 1) % state.FAT_BURNING_TARGET.value
        },
        FAT_BURNING_TARGET: {
            value: 20
        },
        BODY_TEMP: {
            value: 36.5
        },
        SPO2: {
            value: 30,
            getProgress: () => state.SPO2.value / 100
        },
        SUN_CURRENT: {
            value: 0,
            getProgress: () => state.HOUR.value / 24
        },
        WEAR_STATE: {
            value: 0,
            info: "Wear state: 0 - Not worn, 1 - Wearing, 2 - In motion, 3 - not sure"
        },
        MUSIC_TITLE: {
            value: "ECHO",
            type: "string"
        },
        MUSIC_ARTIST: {
            value: "Crusher-P",
            type: "string"
        },
        MUSIC_IS_PLAYING: {
            value: true,
            type: "boolean"
        },
        MOON: {
            getProgress: () => 0.3
        }
    };

    return state;
}