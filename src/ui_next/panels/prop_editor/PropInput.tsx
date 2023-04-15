import {PropEditorEntryProps} from "./PropEditorEntry";
import React from "preact/compat";
import {preventPropagation} from "./preventPropagation";
import {withPlayerStateInputHandler} from "./withPlayerStateInputHandler";

export function PropInput(props: PropEditorEntryProps) {
    const [value, onInput] = withPlayerStateInputHandler(props);

    let type = "number";
    if(props.entry.type == "string") type = "string";
    if(props.entry.type == "boolean") type = "checkbox";

    const maxLength = 14 * (props.entry.maxLength ? props.entry.maxLength : 1) + 14;

    return (
        <input type={type}
               style={{width: props.entry.type !== "boolean" ? maxLength : "initial"}}
               value={String(value)}
               onKeyUp={preventPropagation}
               onInput={onInput} />
    )
}