import {PropEditorEntryProps} from "./PropEditorEntry";
import React from "preact/compat";
import {ChromeZeppPlayer} from "../../../zepp_player/ChromeZeppPlayer";
import {DeviceStateEntry} from "../../../zepp_player/device_state/DeviceStateEntry";
import {NumberDeviceState} from "../../../zepp_player/device_state/NumberDeviceState";

export function withPlayerStateInputHandler(props: PropEditorEntryProps, entry: DeviceStateEntry<any>): [string, (e: any) => any] {
    const [value, setValue] = React.useState<string>(entry.value);

    function onInput(e: any) {
        let value = e.target.value;
        if(entry instanceof NumberDeviceState) value = Number(value);

        props.player.setDeviceState(props.name, value);
        setValue(value);

        if(props.player instanceof ChromeZeppPlayer)
            props.player.saveDeviceStates();
    }

    return [value, onInput];
}