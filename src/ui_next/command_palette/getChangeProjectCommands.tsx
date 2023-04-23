import {ProjectPicker} from "../../ui_managment/ProjectPicker";
import {CommandPaletteItem} from "../palette/CommandPaletteItem";
import React from "preact/compat";

export function getChangeProjectCommands(onSelect: () => any) {
    const projects = ProjectPicker.projects;
    const applyProject = (url: string) => {
        console.log(url);
        ProjectPicker.applyProjectUrl(url);
        onSelect();
    }

    return projects.map((v, i) => (
        <CommandPaletteItem key={i}
                            value={v.url}
                            onSelect={() => applyProject(v.url)}>
            {`Set project: ${v.title}`}
        </CommandPaletteItem>
    ))
}