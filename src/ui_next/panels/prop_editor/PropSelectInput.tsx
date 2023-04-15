import React, {TargetedEvent} from "preact/compat";
import {PropEditorEntryProps} from "./PropEditorEntry";
import {ChromeZeppPlayer} from "../../../zepp_player/ChromeZeppPlayer";
import {preventPropagation} from "./preventPropagation";
import {withPlayerStateInputHandler} from "./withPlayerStateInputHandler";

export function PropSelectInput(props: PropEditorEntryProps) {
    const [value, onInput] = withPlayerStateInputHandler(props);

    return (
        <select value={value} onInput={onInput} onKeyUp={preventPropagation}>
            {props.entry.options.map((v) => <option>{v}</option>)}
        </select>
    )
}
