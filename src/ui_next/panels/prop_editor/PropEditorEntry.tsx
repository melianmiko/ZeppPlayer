import {PropsWithPlayer} from "../../types/ReactProps";
import React from "preact/compat";
import {PropSelectInput} from "./PropSelectInput";
import {PropInput} from "./PropInput";

import "./PropEditorEntry.css"
import {JSX} from "preact";
import {PropCheckboxInput} from "./PropCheckboxInput";
import {DeviceStateEntry} from "../../../zepp_player/device_state/DeviceStateEntry";

export type PropEditorEntryProps = PropsWithPlayer<{
    entry: DeviceStateEntry<any>,
    name: string,
}>

export function PropEditorEntry(props: PropEditorEntryProps) {
    const prettyName = props.name.charAt(0).toUpperCase() +
        props.name.slice(1).replaceAll("_", " ").toLowerCase();

    if(!props.entry.displayConfig) return null;

    let view: JSX.Element;
    switch(props.entry.displayConfig.type) {
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
                {props.entry.displayConfig.displayName || prettyName}
            </span>
            <span>
                {view}
            </span>
        </div>
    )
}

