import {PropEditorEntryProps} from "./PropEditorEntry";
import {ChromeZeppPlayer} from "../../../zepp_player/ChromeZeppPlayer";
import React from "preact/compat";
import {preventPropagation} from "./preventPropagation";
import {DeviceStateEntry} from "../../../zepp_player/device_state/DeviceStateEntry";
import {BooleanDeviceState} from "../../../zepp_player/device_state/BooleanDeviceState";

export function PropCheckboxInput(props: PropEditorEntryProps & { entry: BooleanDeviceState }) {
    const [value, setValue] = React.useState<boolean>(props.entry.value);

    function onChange(e: any) {
        const value = e.target.checked;
        console.log(value);
        props.player.setDeviceState(props.name, value);
        setValue(value);

        if(props.player instanceof ChromeZeppPlayer)
            props.player.saveDeviceStates();
    }

    return (
        <input type="checkbox"
               checked={value}
               onKeyUp={preventPropagation}
               onChange={onChange} />
    )
}