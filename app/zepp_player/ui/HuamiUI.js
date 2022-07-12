import { GroupWidget, DelegateWidget } from "./ApplicationWidgets.js"
import { DatePointer, DateWidget, TimePointer, TimeWidget, WeekdayWidget } from "./DatetimeWidgets.js";
import { ArcProgressWidget, ArcWidget, CircleWidget, FillRectWidget, TextWidget } from "./DrawingWidgets.js";
import { EditableBackground, EditGroupWidget } from "./EditableWatchfaceWidgets.js";
import { ButtonWidget } from "./FormWidgets.js";
import { AnimationWidget, ClickableImageWidget, ImageProgressWidget, ImageStatusWidget, ImageWidget, LevelWidget, MissingWidget, PointerWidget, TextImageWidget } from "./ImagingWidgets.js";

export default class HuamiUIMock {
    _widget = {
        IMG: ImageWidget,
        IMG_POINTER: PointerWidget,
        IMG_STATUS: ImageStatusWidget,
        TEXT_IMG: TextImageWidget,
        IMG_PROGRESS: ImageProgressWidget,
        IMG_LEVEL: LevelWidget,
        IMG_ANIM: AnimationWidget,
        GROUP: GroupWidget,
        FILL_RECT: FillRectWidget,
        IMG_WEEK: WeekdayWidget,
        IMG_TIME: TimeWidget,
        IMG_DATE: DateWidget,
        ARC_PROGRESS: ArcProgressWidget,
        ARC: ArcWidget,
        WATCHFACE_EDIT_MASK: ImageWidget,
        WATCHFACE_EDIT_FG_MASK: ImageWidget,
        WATCHFACE_EDIT_BG: EditableBackground,
        WATCHFACE_EDIT_GROUP: EditGroupWidget,
        TIME_POINTER: TimePointer,
        DATE_POINTER: DatePointer,
        IMG_CLICK: ClickableImageWidget,
        WIDGET_DELEGATE: DelegateWidget,
        TEXT: TextWidget,
        CIRCLE: CircleWidget,
        BUTTON: ButtonWidget
    }

    constructor(player) {
        this.player = player;
        this.widget = {};
        this.toastWidget = null;

        for(var a in this._widget) this.widget[a] = a;
    }

    deleteWidget(widget) {
        const widgets = this.player.widgets;
        for(var i in widgets) {
            if(widgets[i].config.__id == widget.__id) {
                widgets.splice(i, 1);
                return;
            } else if(widgets[i].config.__content && widgets[i].config.__content.indexOf(widget) > -1) {
                const j = widgets[i].config.__content.indexOf(widget);
                widgets[i].config.__content.splice(j, 1);
                this.player.refresh_required = "del_widget";
                return;
            }
        }

        console.warn("can't delete undefined widget", widget);
        return;
    }

    createWidget(type, config) {
        let Widget = this._widget[type];
        if(!Widget) {
            Widget = MissingWidget;
        }

        if(typeof config !== "object") {
            config = {};
        }

        config.__widget = type;
        config.__id = this.player.widgets.length;
        config.__player = this.player;

        const i = new Widget(config);
        this.player.widgets.push(i);
        this.player.refresh_required = "add_widget";

        return i;
    }

    showToast(options) {
        if(!this.toastWidget) {
            this.toastWidget = this.createWidget(this.widget.BUTTON, {
                x: 10,
                y: 150,
                w: 172,
                h: 190,
                text: "",
                visible: false,
                text_size: 16,
                radius: 8,
                press_color: 0x222222,
                normal_color: 0x222222,
                click_func: () => this.toastWidget.setProperty(this.prop.VISIBLE, false)
            });
        }

        this.toastWidget.setProperty(this.prop.MORE, {
            text: options.text,
            visible: true
        });
    }

    prop = {
        VISIBLE: "visible",
        ANIM_STATUS: "anim_status",
        ANGLE: "angle",
        SRC: "src",
        CURRENT_TYPE: "current_type",
        MORE: "more"
    }

    show_level = {
        ONLY_NORMAL: 1,
        ONLY_AOD: 2,
        ONAL_AOD: 2,
        ONLY_EDIT: 4,
        ALL: 1 & 2 
    }

    align = {
        LEFT: "left",
        RIGHT: "right",
        CENTER_H: "center_h",
        CENTER_V: "center_v",
        TOP: "top",
        BOTTOM: "bottom"
    }

    event = {
        CLICK_DOWN: "onmousedown",
        CLICK_UP: "onmouseup",
        MOVE: "move",
        MOVE_IN: "move_in",
        MOVE_OUT: "move_out"
    }

    text_style = {
        WRAP: 2,
        CHAR_WRAP: 1,
        ELLIPSIS: 0,
        NONE: 0
    }

    system_status = {
        CLOCK: "ALARM_CLOCK",
        DISCONNECT: "DISCONNECT",
        DISTURB: "DISTURB",
        LOCK: "LOCK"
    }

    anim_status = {
        START: 1,
        PAUSE: 0,
        RESUME: 1,
        STOP: 0
    }

    data_type = {
        "BATTERY": "BATTERY",
        "STEP": "STEP",
        "STEP_TARGET": "STEP_TARGET",
        "CAL": "CAL",
        "CAL_TARGET": "CAL_TARGET",
        "HEART": "HEART",
        "PAI_DAILY": "PAI_DAILY",
        "PAI_WEEKLY": "PAI_WEEKLY",
        "DISTANCE": "DISTANCE",
        "STAND": "STAND",
        "STAND_TARGET": "STAND_TARGET",
        "WEATHER": "WEATHER_CURRENT",
        "WEATHER_CURRENT": "WEATHER_CURRENT",
        "WEATHER_LOW": "WEATHER_LOW",
        "WEATHER_HIGH": "WEATHER_HIGH",
        "UVI": "UVI",
        "AQI": "AQI",
        "HUMIDITY": "HUMIDITY",
        "ACTIVITY": "ACTIVITY",
        "ACTIVITY_TARGET": "ACTIVITY_TARGET",
        "FAT_BURNING": "FAT_BURNING",
        "FAT_BURNING_TARGET": "FAT_BURNING_TARGET",
        "SUN_CURRENT": "SUN_CURRENT",
        "SUN_RISE": "SUN_RISE",
        "SUN_SET": "SUN_SET",
        "WIND": "WIND",
        "STRESS": "STRESS",
        "SPO2": "SPO2",
        "ALTIMETER": "ALTIMETER",
        "MOON": "MOON",
        "FLOOR": "FLOOR",
        "ALARM_CLOCK": "ALARM_CLOCK",
        "COUNT_DOWN": "COUNT_DOWN",
        "STOP_WATCH": "STOP_WATCH",
        "SLEEP": "SLEEP"
    }

    edit_type = {
        "BATTERY": "BATTERY",
        "STEP": "STEP",
        "STEP_TARGET": "STEP_TARGET",
        "CAL": "CAL",
        "CAL_TARGET": "CAL_TARGET",
        "HEART": "HEART",
        "PAI_DAILY": "PAI_DAILY",
        "PAI_WEEKLY": "PAI_WEEKLY",
        "DISTANCE": "DISTANCE",
        "STAND": "STAND",
        "STAND_TARGET": "STAND_TARGET",
        "WEATHER_CURRENT": "WEATHER_CURRENT",
        "WEATHER_LOW": "WEATHER_LOW",
        "WEATHER_HIGH": "WEATHER_HIGH",
        "UVI": "UVI",
        "AQI": "AQI",
        "HUMIDITY": "HUMIDITY",
        "FAT_BURNING": "FAT_BURNING",
        "FAT_BURNING_TARGET": "FAT_BURNING_TARGET",
        "SUN_CURRENT": "SUN_CURRENT",
        "SUN_RISE": "SUN_RISE",
        "SUN_SET": "SUN_SET",
        "WIND": "WIND",
        "STRESS": "STRESS",
        "SPO2": "SPO2",
        "BODY_TEMP": "BODY_TEMP",
        "ALTIMETER": "ALTIMETER",
        "MOON": "MOON",
        "FLOOR": "FLOOR",
        "ALARM_CLOCK": "ALARM_CLOCK",
        "COUNT_DOWN": "COUNT_DOWN",
        "STOP_WATCH": "STOP_WATCH",
        "SLEEP": "SLEEP"
    }
}
