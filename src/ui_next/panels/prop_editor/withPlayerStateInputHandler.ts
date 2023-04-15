import {PropEditorEntryProps} from "./PropEditorEntry";
import React from "preact/compat";
import {ChromeZeppPlayer} from "../../../zepp_player/ChromeZeppPlayer";

export function withPlayerStateInputHandler(props: PropEditorEntryProps): [string, (e: any) => any] {
    const [value, setValue] = React.useState<string>(props.entry.value);

    function onInput(e: any) {
        let value = e.target.value;
        if(props.entry.type === "number") value = Number(value);

        props.player.setDeviceState(props.name, value);
        setValue(value);

        if(props.player instanceof ChromeZeppPlayer)
            props.player.saveDeviceStates();
    }

    return [value, onInput];
}