import {PropsWithPlayer} from "../../types/ReactProps";
import React from "preact/compat";
import {PropSelectInput} from "./PropSelectInput";
import {PropInput} from "./PropInput";

import "./PropEditorEntry.css"
import {JSX} from "preact";
import {PropCheckboxInput} from "./PropCheckboxInput";
import {DeviceState} from "../../../zepp_player/DeviceStateObject";
import {BooleanDeviceState} from "../../../zepp_player/device_state/BooleanDeviceState";
import {SelectDeviceState} from "../../../zepp_player/device_state/SelectDeviceState";

export type PropEditorEntryProps = PropsWithPlayer<{
    name: keyof DeviceState,
}>

export function PropEditorEntry(props: PropEditorEntryProps) {
    const prettyName = props.name.charAt(0).toUpperCase() +
        props.name.slice(1).replaceAll("_", " ").toLowerCase();

    const entry = props.player.deviceState[props.name];

    if(!entry.displayConfig) return null;

    let view: JSX.Element;
    if(entry instanceof BooleanDeviceState) {
        view = <PropCheckboxInput {...props} entry={entry} />;
    } else if(entry instanceof  SelectDeviceState) {
        view = <PropSelectInput {...props} entry={entry} />;
    } else {
        view = <PropInput {...props} entry={entry} />;
    }

    return (
        <div className="props-entry">
            <span className="props-entry__title">
                {entry.displayConfig.displayName || prettyName}
            </span>
            <span>
                {view}
            </span>
        </div>
    )
}

