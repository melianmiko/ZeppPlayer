/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2023  MelianMiko

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

import React from "preact/compat";
import {PropsWithPlayer} from "../types/ReactProps";
import {PropEditorGroup} from "./prop_editor/PropEditorGroup";
import {PropEditorEntry} from "./prop_editor/PropEditorEntry";
import {RealTimeSwitch} from "./prop_editor/RealTimeSwitch";

export function PropEditorPanel(props: PropsWithPlayer<{}>) {
    return (
        <>
            <RealTimeSwitch player={props.player} />
            <PropEditorGroup icon="calendar_month">
                <PropEditorEntry name={"HOUR"} {...props} />
                <PropEditorEntry name={"MINUTE"} {...props} />
                <PropEditorEntry name={"SECOND"} {...props} />
                <PropEditorEntry name={"DAY"} {...props} />
                <PropEditorEntry name={"MONTH"} {...props} />
                <PropEditorEntry name={"YEAR"} {...props} />
                <PropEditorEntry name={"WEEKDAY"} {...props} />
                <PropEditorEntry name={"AM_PM"} {...props} />
            </PropEditorGroup>
            <PropEditorGroup icon="settings">
                <PropEditorEntry name={"OS_LANGUAGE"} {...props} />
                <PropEditorEntry name={"OVERLAY_COLOR"} {...props} />
                <PropEditorEntry name={"ALARM_CLOCK"} {...props} />
                <PropEditorEntry name={"BATTERY"} {...props} />
                <PropEditorEntry name={"WEAR_STATE"} {...props} />
                <PropEditorEntry name={"DISCONNECT"} {...props} />
                <PropEditorEntry name={"DISTURB"} {...props} />
                <PropEditorEntry name={"LOCK"} {...props} />
            </PropEditorGroup>
            <PropEditorGroup icon="fitness_center">
                <PropEditorEntry name={"STEP"} {...props} />
                <PropEditorEntry name={"STEP_TARGET"} {...props} />
                <PropEditorEntry name={"DISTANCE"} {...props} />
                <PropEditorEntry name={"CAL"} {...props} />
                <PropEditorEntry name={"CAL_TARGET"} {...props} />
                <PropEditorEntry name={"STAND"} {...props} />
                <PropEditorEntry name={"STAND_TARGET"} {...props} />
                <PropEditorEntry name={"FAT_BURNING"} {...props} />
                <PropEditorEntry name={"FAT_BURNING_TARGET"} {...props} />
            </PropEditorGroup>
            <PropEditorGroup icon="monitor_heart">
                <PropEditorEntry name={"HEART"} {...props} />
                <PropEditorEntry name={"SLEEP"} {...props} />
                <PropEditorEntry name={"SPO2"} {...props} />
                <PropEditorEntry name={"PAI_WEEKLY"} {...props} />
                <PropEditorEntry name={"PAI_DAILY"} {...props} />
                <PropEditorEntry name={"STRESS"} {...props} />
                <PropEditorEntry name={"BODY_TEMP"} {...props} />
            </PropEditorGroup>
            <PropEditorGroup icon="sunny">
                <PropEditorEntry name={"WEATHER_CURRENT"} {...props} />
                <PropEditorEntry name={"WEATHER_HIGH"} {...props} />
                <PropEditorEntry name={"WEATHER_LOW"} {...props} />
                <PropEditorEntry name={"WEATHER_CURRENT_ICON"} {...props} />
                <PropEditorEntry name={"PAI_DAILY"} {...props} />
                <PropEditorEntry name={"WIND"} {...props} />
                <PropEditorEntry name={"WIND_DIRECTION"} {...props} />
                <PropEditorEntry name={"AQI"} {...props} />
                <PropEditorEntry name={"HUMIDITY"} {...props} />
                <PropEditorEntry name={"ALTIMETER"} {...props} />
                <PropEditorEntry name={"UVI"} {...props} />
                <PropEditorEntry name={"SUN_CURRENT"} {...props} />
                <PropEditorEntry name={"MOON"} {...props} />
                <PropEditorEntry name={"WEATHER_CITY"} {...props} />
            </PropEditorGroup>
            <PropEditorGroup icon="apps">
                <PropEditorEntry name={"STOP_WATCH"} {...props} />
                <PropEditorEntry name={"COUNT_DOWN"} {...props} />
                <PropEditorEntry name={"MUSIC_IS_PLAYING"} {...props} />
                <PropEditorEntry name={"MUSIC_ARTIST"} {...props} />
                <PropEditorEntry name={"MUSIC_TITLE"} {...props} />
            </PropEditorGroup>
        </>
    )
}
