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

import {GroupWidget, DelegateWidget, RadioGroupWidget, StateButtonWidget} from "./ApplicationWidgets.js"
import { DatePointer, DateWidget, TimePointer, TimeWidget, WeekdayWidget } from "./DatetimeWidgets.js";
import { ArcProgressWidget, ArcWidget, CircleWidget, FillRectWidget, StrokeRectWidget, TextWidget } from "./DrawingWidgets.js";
import {EditableBackground, EditGroupWidget, EditPointerWidget} from "./EditableWatchfaceWidgets.js";
import { ButtonWidget } from "./FormWidgets.js";
import { HistogramWidget } from "./HistogramWidget.js";
import { AnimationWidget, ClickableImageWidget, ImageProgressWidget, ImageStatusWidget, ImageWidget, LevelWidget, MissingWidget, PointerWidget, TextImageWidget } from "./ImagingWidgets.js";
import {ScrollList} from "./ScrollList";

export default class HuamiUIMock {
    _idCounter = 0;
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
        STROKE_RECT: StrokeRectWidget,
        IMG_WEEK: WeekdayWidget,
        IMG_TIME: TimeWidget,
        IMG_DATE: DateWidget,
        ARC_PROGRESS: ArcProgressWidget,
        ARC: ArcWidget,
        WATCHFACE_EDIT_MASK: ImageWidget,
        WATCHFACE_EDIT_FG_MASK: ImageWidget,
        WATCHFACE_EDIT_BG: EditableBackground,
        WATCHFACE_EDIT_GROUP: EditGroupWidget,
        WATCHFACE_EDIT_POINTER: EditPointerWidget,
        TIME_POINTER: TimePointer,
        DATE_POINTER: DatePointer,
        IMG_CLICK: ClickableImageWidget,
        WIDGET_DELEGATE: DelegateWidget,
        TEXT: TextWidget,
        CIRCLE: CircleWidget,
        BUTTON: ButtonWidget,
        HISTOGRAM: HistogramWidget,
        SCROLL_LIST: ScrollList,
        RADIO_GROUP: RadioGroupWidget,
        STATE_BUTTON: StateButtonWidget
    }

    constructor(runtime) {
        this.runtime = runtime;
        this.widget = {};
        this.toastWidget = null;

        for(let a in this._widget) this.widget[a] = a;
    }

    deleteWidget(widget) {
        const widgets = this.runtime.widgets;
        const targetId = widget.config.__id;
        for(let i in widgets) {
            if(widgets[i].config.__id === targetId) {
                widgets.splice(parseInt(i), 1);
                this.runtime.refresh_required = "del_widget";
                return;
            } else if(widgets[i].config.__content) {
                const groupContent = widgets[i].config.__content;
                for(let j in groupContent) {
                    if(groupContent[j].config.__id === targetId) {
                        widgets[i].config.__content.splice(parseInt(j), 1);
                        this.runtime.refresh_required = "del_widget";
                        return;
                    }
                }
            }
        }

        console.warn("can't delete undefined widget", widget);
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
        config.__id = this._idCounter;
        config.__runtime = this.runtime;

        const i = new Widget(config);
        this.runtime.widgets.push(i);
        this._idCounter++;
        this.runtime.refresh_required = "add_widget";

        return i;
    }

    showToast(options) {
        if(!this.toastWidget) {
            const screenWidth = this.runtime.screen[0];
            const toastWidth = Math.max(170, Math.round(screenWidth / 2))
            this.toastWidget = this.createWidget(this.widget.BUTTON, {
                x: Math.round((screenWidth - toastWidth) / 2),
                y: 70,
                w: toastWidth,
                h: 50,
                text: "",
                visible: false,
                text_size: 22,
                radius: 25,
                press_color: 0x222222,
                normal_color: 0x222222,
                click_func: () => this.toastWidget.setProperty(this.prop.VISIBLE, false)
            });
        }

        this.toastWidget.setProperty('visible', true);
        this.toastWidget.setProperty(this.prop.MORE, {
            text: options.text
        });

        setTimeout(() => {
            this.toastWidget.setProperty("visible", false);
        }, 3000);
    }

    setLayerScrolling(val) {}

    setStatusBarVisible() {}

    getTextLayout(text, options) {
        const canvas = TextWidget.drawText({
            text,
            text_size: options.text_size,
            w: options.text_width,
            text_style: 2,
            _metricsOnly: true
        }, this.runtime);

        return {
            width: canvas.width,
            height: canvas.height
        }
    }

    prop = {
        VISIBLE: "visible",
        ANIM_STATUS: "anim_status",
        ANGLE: "angle",
        SRC: "src",
        CURRENT_TYPE: "current_type",
        CURRENT_CONFIG: "current_config",
        MORE: "more",
        ANIM: "more",
        UPDATE_DATA: "more",
        X: "x",
        Y: "y",
        W: "w",
        H: "h",
        POS_X: "pos_x",
        POS_Y: "pos_y",
        CENTER_X: "center_x",
        CENTER_Y: "center_y",
        TEXT: "text",
        TEXT_SIZE: "text_size",
        COLOR: "color",
        RADIUS: "radius",
        START_ANGLE: "start_angle",
        END_ANGLE: "end_angle",
        LINE_WIDTH: "line_width",
        WORD_WRAP: "word_wrap",
        DATASET: "dataset",
        INIT: "checked",
        CHECKED: "checked",
        CURRENT_SELECT: "checked"
    }

    show_level = {
        ONLY_NORMAL: 1,
        ONLY_AOD: 2,
        ONAL_AOD: 2,
        ONLY_EDIT: 4,
        ALL: 1 | 2 | 4
    }

    align = {
        LEFT: "left",
        RIGHT: "right",
        CENTER_H: "center_h",
        CENTER_V: "center_v",
        TOP: "top",
        BOTTOM: "bottom"
    }

    date = {
        MONTH: "MONTH",
        DAY: "DAY",
        YEAR: "YEAR",
        WEEK: "WEEKDAY"
    }

    event = {
        CLICK_DOWN: "onmousedown",
        CLICK_UP: "onmouseup",
        MOVE: "onmousemove",
        SELECT: "onmouseup"
    }

    text_style = {
        WRAP: 2,
        CHAR_WRAP: 2,
        ELLIPSIS: 3,
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
        "WIND_DIRECTION": "WIND_DIRECTION",
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
        "FAT_BURN": "FAT_BURNING",
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
        "WEATHER": "WEATHER",
        "SLEEP": "SLEEP"
    }
}
