import React from "preact/compat";
import normalize from "path-normalize";
import {Backdrop} from "./base/Backdrop";
import {CommandPalette} from "./palette/CommandPalette";
import {CommandPaletteItem} from "./palette/CommandPaletteItem";

type State = {
    path: string,
    currentPath: string,
    items: string[]
}

export function ServerDirectoryPicker(props: {open: boolean, onCancel?: () => any}) {
    const [{path, currentPath, items}, setState] = React.useState<State>({
        path: "",
        currentPath: "",
        items: null
    });

    React.useEffect(() => {
        if(!props.open) return;
        if(items == null) {
            reload();
        }
    });

    async function reload() {
        const resp = await fetch("/api/folder_chooser/" + path);
        const data = await resp.json();

        setState({
            path,
            currentPath: data.current_path,
            items: [
                "..",
                ...data.contents
            ]
        })
    }

    async function handleSelect(v: string) {
        if(v == "$$apply$$") {
            const resp = await fetch(`/api/set_projects_dir/${path}`);
            if(resp.status == 200) {
                location.reload();
            }
            return;
        }

        let newPath = normalize(`${path}/${v}`);
        if(newPath[0] == "/") newPath = newPath.substring(1);

        setState({
            path: newPath,
            currentPath: "",
            items: null
        });
    }

    if(!items) return null;
    return (
        <Backdrop open={props.open}>
            <CommandPalette onSelect={handleSelect} onCancel={props.onCancel}>
                <CommandPaletteItem value="$$apply$$">
                    {`Use ${currentPath} directory`}
                </CommandPaletteItem>
                {items.map((v) => (
                    <CommandPaletteItem value={v}>{v}</CommandPaletteItem>
                ))}
            </CommandPalette>
        </Backdrop>
    )
}