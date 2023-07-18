import {render} from "preact";
import React from "preact/compat";
import {ServerDirectoryPicker} from "./ServerDirectoryPicker";
import {PropEditorPanel} from "./panels/PropEditorPanel";
import ZeppPlayer from "../zepp_player/ZeppPlayer";
import {CommandPicker} from "./CommandPicker";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "./base/Modal";
import {Button} from "./base/Button";
import {PlayerSettingsPane} from "./settings_pane/PlayerSettingsPane";
import {OverviewRoot} from "./overview/OverviewRoot";


export function RootComponent() {
    const [pane, setPane] = React.useState<string>("");
    (window as any)._setReactPane = setPane;

    return (
        <>
            <ServerDirectoryPicker open={pane == "change_projects_dir"}
                                   onCancel={() => setPane("")} />
            <CommandPicker open={pane == "command_picker"}
                           changePane={setPane} />
            <OverviewRoot open={pane == "overview"}
                          onClose={() => setPane("")} />
            <PlayerSettingsPane open={pane == "settings"}
                                onCancel={() => setPane("")} />
        </>
    )
}

export function start(node: HTMLElement, player: ZeppPlayer) {
    render(<RootComponent />, node);

    // Override legacy components
    render(<PropEditorPanel player={player} />, document.getElementById("view_edit"));
}
