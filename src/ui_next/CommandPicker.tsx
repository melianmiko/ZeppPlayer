import {Backdrop} from "./base/Backdrop";
import {CommandPalette} from "./palette/CommandPalette";
import React from "preact/compat";
import {getChangeProjectCommands} from "./command_palette/getChangeProjectCommands";
import {getChangeProfileCommands} from "./command_palette/getChangeProfileCommands";
import {CommandPaletteItem} from "./palette/CommandPaletteItem";

export type CommandPickerProps = {
    open: boolean,
    changePane: (pane: string) => any,
};

export function CommandPicker(props: CommandPickerProps) {
    const onCancel = () => props.changePane("");

    return (
        <Backdrop open={props.open}>
            <CommandPalette onCancel={onCancel}>
                <CommandPaletteItem value="ch_dir" onSelect={() => props.changePane("change_projects_dir")}>
                    {"Change projects directory"}
                </CommandPaletteItem>
                <CommandPaletteItem value="p_cfg" onSelect={() => props.changePane("settings")}>
                    {"Open player settings"}
                </CommandPaletteItem>
                {...getChangeProjectCommands(onCancel)}
                {...getChangeProfileCommands(onCancel)}
            </CommandPalette>
        </Backdrop>
    );
}