import {render} from "preact";
import React from "preact/compat";
import {ServerDirectoryPicker} from "./ServerDirectoryPicker";
import {PropEditorPanel} from "./panels/PropEditorPanel";
import ZeppPlayer from "../zepp_player/ZeppPlayer";
import {CommandPicker} from "./CommandPicker";


export function RootComponent() {
    const [pane, setPane] = React.useState<string>("");
    (window as any)._setReactPane = setPane;

    return (
        <>
            <ServerDirectoryPicker open={pane == "change_projects_dir"}
                                   onCancel={() => setPane("")} />
            <CommandPicker open={pane == "command_picker"}
                           onCancel={() => setPane("")} />
        </>
    )
}

export function start(node: HTMLElement, player: ZeppPlayer) {
    render(<RootComponent />, node);

    // Override legacy components
    render(<PropEditorPanel player={player} />, document.getElementById("view_edit"));
}
