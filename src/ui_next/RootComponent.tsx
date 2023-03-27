import {render} from "preact";
import React from "preact/compat";
import {ServerDirectoryPicker} from "./ServerDirectoryPicker";


export function RootComponent() {
    const [pane, setPane] = React.useState<string>("");
    (window as any)._setReactPane = setPane;

    return (
        <>
            <ServerDirectoryPicker open={pane == "change_projects_dir"}
                                   onCancel={() => setPane("")} />
        </>
    )
}

export function start(node: HTMLElement) {
    render(<RootComponent />, node);
}
