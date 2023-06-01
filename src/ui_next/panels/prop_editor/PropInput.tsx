import {PropEditorEntryProps} from "./PropEditorEntry";
import React from "preact/compat";
import {preventPropagation} from "./preventPropagation";
import {withPlayerStateInputHandler} from "./withPlayerStateInputHandler";
import {DeviceStateEntry} from "../../../zepp_player/device_state/DeviceStateEntry";
import {StringDeviceState} from "../../../zepp_player/device_state/StringDeviceState";

export function PropInput(props: PropEditorEntryProps & {entry: DeviceStateEntry<string|number>}) {
    const [value, onInput] = withPlayerStateInputHandler(props, props.entry);

    let type = "number";
    if(props.entry instanceof StringDeviceState) type = "string";

    const maxLength = 14 * (props.entry.displayConfig.maxLength ? props.entry.displayConfig.maxLength : 1) + 14;

    return (
        <input type={type}
               style={{width: maxLength}}
               value={String(value)}
               onKeyUp={preventPropagation}
               onInput={onInput} />
    )
}