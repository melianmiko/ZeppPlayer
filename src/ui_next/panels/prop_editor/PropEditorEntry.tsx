import {PropsWithPlayer} from "../../types/ReactProps";
import React from "preact/compat";
import {PlayerStateEntry} from "../../types/PlayerProps";
import {PropSelectInput} from "./PropSelectInput";
import {PropInput} from "./PropInput";

import "./PropEditorEntry.css"
import {JSX} from "preact";
import {PropCheckboxInput} from "./PropCheckboxInput";

export type PropEditorEntryProps = PropsWithPlayer<{
    entry: PlayerStateEntry,
    name: string,
}>

export function PropEditorEntry(props: PropEditorEntryProps) {
    const prettyName = props.name.charAt(0).toUpperCase() +
        props.name.slice(1).replaceAll("_", " ").toLowerCase();

    let view: JSX.Element = null;
    switch(props.entry.type) {
        case "select":
            view = <PropSelectInput {...props} />;
            break;
        case "boolean":
            view = <PropCheckboxInput {...props} />;
            break;
        default:
            view = <PropInput {...props} />;
    }

    return (
        <div className="props-entry">
            <span className="props-entry__title">
                {props.entry.displayName || prettyName}
            </span>
            <span>
                {view}
            </span>
        </div>
    )
}

