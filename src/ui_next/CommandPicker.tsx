import {Backdrop} from "./base/Backdrop";
import {CommandPalette} from "./palette/CommandPalette";
import React from "preact/compat";
import {getChangeProjectCommands} from "./command_palette/getChangeProjectCommands";
import {getChangeProfileCommands} from "./command_palette/getChangeProfileCommands";

export function CommandPicker(props: {open: boolean, onCancel?: () => any}) {

    return (
        <Backdrop open={props.open}>
            <CommandPalette onCancel={props.onCancel}>
                {...getChangeProjectCommands(props.onCancel)}
                {...getChangeProfileCommands(props.onCancel)}
            </CommandPalette>
        </Backdrop>
    );
}