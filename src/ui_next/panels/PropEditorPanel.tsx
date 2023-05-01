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
import ZeppPlayer from "../../zepp_player/ZeppPlayer";
import {GroupedPlayerStates} from "../types/PlayerProps";
import {PropEditorGroup} from "./prop_editor/PropEditorGroup";
import {PropEditorEntry} from "./prop_editor/PropEditorEntry";
import {RealTimeSwitch} from "./prop_editor/RealTimeSwitch";
import {DeviceStateEntry} from "../../zepp_player/device_state/DeviceStateEntry";

function withGroupedPlayerProps(player: ZeppPlayer) {
    const [data, setData] = React.useState<GroupedPlayerStates>(null);

    React.useEffect(() => {
        if(data != null) return;

        const groupedStates: GroupedPlayerStates = {};
        for(const key in player._deviceState) {
            const entry: DeviceStateEntry<any> = player.getStateEntry(key);
            if(!entry.displayConfig) continue;
            const group = entry.displayConfig.groupIcon;
            if(!groupedStates.hasOwnProperty(group))
                groupedStates[group] = {};
            groupedStates[group][key] = entry;
        }

        setData(groupedStates);
    });

    return data;
}

export function PropEditorPanel(props: PropsWithPlayer<{}>) {
    const states = withGroupedPlayerProps(props.player);

    if(!states) return null;
    return (
        <>
            <RealTimeSwitch player={props.player} />
            {Object.keys((states)).map((group) => (
                <PropEditorGroup icon={group}>
                    {Object.keys(states[group]).map((name) => (
                        <PropEditorEntry entry={states[group][name]} name={name} player={props.player} />
                    ))}
                </PropEditorGroup>
            ))}
        </>
    )
}