export function createDeviceState() {
    const state = {
        ALARM_CLOCK: {
            value: "09:30",
            type: "string",
            maxLength: 5,
            getBoolean: (v) => v.value !== "",
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
                if(tick % 2 != 0) return null;
                const vals = ["", "06:00", "09:30", "11:00"];
                let index = vals.indexOf(t.value);
                if(index < 0) index = 0;
                return vals[index + 1 % vals.length];
            }
        },
        DISCONNECT: {
            value: false,
            type: "boolean",
            maxLength: 5,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 == 1 ? !t.value : null
        },
        DISTURB: {
            value: true,
            type: "boolean",
            maxLength: 5,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 == 2 ? !t.value : null
        },
        LOCK: {
            value: true,
            type: "boolean",
            maxLength: 5,
            getBoolean: (v) => v.value,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 == 0 ? !t.value : null
        },
        STEP: {
            value: 4500,
            type: "number",
            maxLength: 5,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.STEP_TARGET.value,
            shift: (_, t) => (t.value + 500) % state.STEP_TARGET.value
        },
        STEP_TARGET: {
            value: 9000,
            type: "number",
            maxLength: 5,
            getString: (t) => t.value.toString()
        },
        DISTANCE: {
            value: 1.5,
            type: "number",
            maxLength: 4,
            getString: (t) => {
                let km = Math.floor(t.value).toString(),
                    dm = Math.round((t.value % 1) * 100).toString().padStart(2, "0");
                
                if(t.value >= 10) dm = dm[0];
                return km + "." + dm;
            },
            shift: () => (state.DISTANCE.value + 0.5) % 20
        },
        HEART: {
            value: 99,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 180,
            shift: () => (state.HEART.value + 15) % 180
        },
        CAL: {
            value: 320,
            type: "number",
            maxLength: 4,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.CAL_TARGET.value,
            shift: (_, t) => (t.value + 30) % state.CAL_TARGET.value
        },
        CAL_TARGET: {
            value: 500,
            type: "number",
            maxLength: 4,
            getString: (t) => t.value.toString()
        },
        BATTERY: {
            value: 60,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: (_, t) => (t.value) % 100 + 10
        },
        WEEKDAY: {
            value: 0,
            type: "number",
            maxLength: 1,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 6,
            shift: (tick) => tick % 2 == 0 ? (state.WEEKDAY.value + 1) % 7 : null
        },
        HOUR: {
            value: 9,
            type: "number",
            maxLength: 0, // not required
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 12,
            shift: (tick) => tick % 2 == 0 ? (state.HOUR.value + 1) % 24 : null
        },
        MINUTE: {
            value: 30,
            type: "number",
            maxLength: 0, // not required
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 60,
            shift: () => (state.MINUTE.value + 5) % 60
        },
        SECOND: {
            value: 45,
            type: "number",
            maxLength: 0, // not required
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 60,
            shift: () => (state.SECOND.value + 1) % 60
        },
        DAY: {
            value: 15,
            type: "number",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 31,
            shift: () => (state.DAY.value + 1) % 31
        },
        MONTH: {
            value: 9,
            type: "number",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 12,
            shift: (tick) => tick % 2 == 0 ? state.MONTH.value % 12 + 1 : null
        },
        STAND: {
            value: 12,
            type: "number",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / state.STAND_TARGET.value,
            shift: (tick) => tick % 2 == 0 ? state.STAND.value % state.STAND_TARGET.value + 1 : null
        },
        STAND_TARGET: {
            value: 13,
            type: "number",
            maxLength: 2,
            getString: (t) => t.value.toString()
        },
        YEAR: {
            value: 2022,
            type: "number",
            maxLength: 4,
            getString: (t) => t.value.toString()
        },
        AM_PM: {
            value: "hide",
            type: "string",
            info: "AM/PM state: hide - 24h mode, am/pm - 12h mode",
            maxLength: 4,
            getString: (t) => t.value,
            shift: () => {
                if(state.AM_PM == "hidden") return "am";
                if(state.AM_PM == "am") return "pm";
                return "hidden";
            }
        },
        PAI_WEEKLY: {
            value: 55,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: (tick) => tick % 3 == 0 ? state.PAI_WEEKLY.value % 100 + 4 : null
        },
        PAI_DAILY: {
            value: 80,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.PAI_DAILY.value % 100 + 4
        },
        WEATHER_CURRENT_ICON: {
            value: 0,
            shift: () => (state.WEATHER_CURRENT_ICON.value + 1) % 29
        },
        WEATHER_CURRENT: {
            value: 12,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: () => state.WEATHER_CURRENT_ICON.value / 29, //redir to icon
            shift: (tick, t) => (Math.abs(t.value) + 2) % 30 * (tick % 4 < 2 ? -1 : 1)
        },
        HUMIDITY: {
            value: 10,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.HUMIDITY.value % 92 + 8
        },
        UVI: {
            value: 10,
            type: "number",
            maxLength: 2,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.UVI.value % 100 + 5
        },
        STRESS: {
            value: 50,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100,
            shift: () => state.STRESS.value % 100 + 5
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
        SPO2: {
            value: 30,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value / 100
        },
        SUN_CURRENT: { // ???
            value: 0,
            type: "number",
            maxLength: 3,
            getString: (t) => t.value.toString(),
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
            type: "boolean",
            maxLength: 5,
            getString: (t) => t.value.toString(),
            getProgress: (t) => t.value ? 1 : 0,
            shift: (tick, t) => tick % 3 == 0 ? !t.value : null
        },
        MOON: { // ???
            getProgress: () => 0.3
        }
    };

    return state;
}
