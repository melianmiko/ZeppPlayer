import {PropEditorEntryProps} from "./PropEditorEntry";
import React from "preact/compat";
import {preventPropagation} from "./preventPropagation";
import {withPlayerStateInputHandler} from "./withPlayerStateInputHandler";

export function PropInput(props: PropEditorEntryProps) {
    const [value, onInput] = withPlayerStateInputHandler(props);

    let type = "number";
    if(props.entry.displayConfig.type == "string") type = "string";
    if(props.entry.displayConfig.type == "boolean") type = "checkbox";

    const maxLength = 14 * (props.entry.displayConfig.maxLength ? props.entry.displayConfig.maxLength : 1) + 14;

    return (
        <input type={type}
               style={{width: props.entry.displayConfig.type !== "boolean" ? maxLength : "initial"}}
               value={String(value)}
               onKeyUp={preventPropagation}
               onInput={onInput} />
    )
}