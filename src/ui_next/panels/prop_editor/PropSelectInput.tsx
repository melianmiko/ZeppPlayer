import React, {TargetedEvent} from "preact/compat";
import {PropEditorEntryProps} from "./PropEditorEntry";
import {ChromeZeppPlayer} from "../../../zepp_player/ChromeZeppPlayer";
import {preventPropagation} from "./preventPropagation";
import {withPlayerStateInputHandler} from "./withPlayerStateInputHandler";
import {DeviceStateEntry} from "../../../zepp_player/device_state/DeviceStateEntry";
import {SelectDeviceState} from "../../../zepp_player/device_state/SelectDeviceState";

export function PropSelectInput(props: PropEditorEntryProps & {entry: SelectDeviceState}) {
    const [value, onInput] = withPlayerStateInputHandler(props, props.entry);

    return (
        <select value={value} onInput={onInput} onKeyUp={preventPropagation}>
            {props.entry.options.map((v) => <option>{v}</option>)}
        </select>
    )
}
