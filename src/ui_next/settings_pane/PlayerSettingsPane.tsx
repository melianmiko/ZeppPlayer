import React from "preact/compat";
import {Dialog, DialogActions, DialogContent, DialogTitle} from "../base/Modal";
import {BackdropProps} from "../base/Backdrop";
import {Button} from "../base/Button";
import {BooleanSettingsOption} from "./BooleanSettingsOption";
import {CssSettingsOption} from "./CssSettingsOption";
import {CssColorOptions} from "./CssColorOptions";
import AppSettingsManager from "../../ui_managment/AppSettingsManager";

export function PlayerSettingsPane(props: BackdropProps) {
    const performWipe = () => {
        if(confirm("Restore default player settings? Project files won't be deleted")) {
            localStorage.clear();
            location.reload();
        }
    }

    return (
        <Dialog {...props} maxWidth="500px">
            <DialogTitle>
                ZeppPlayer Settings
            </DialogTitle>
            <DialogContent noMargin>
                <BooleanSettingsOption
                    title="Keep & restore editor state"
                    description={'If enabled, all changes made in "Editor" pane will be kept since player reload'}
                    configKey="cfgKeepState"
                    fallback={true} />
                <BooleanSettingsOption
                    title="Auto-restart on project files change"
                    description="If enabled, any changes made in project assets/code will trigger player to reload it"
                    configKey="cfgAutoRefresh"
                    fallback={true} />
                <BooleanSettingsOption
                    title='Prefer "build" directory if they exists'
                    description={"If enabled and current project has \"build\" directory, them player will run preview " +
                        "from this directory instead of main project root."}
                    configKey="preferBuildDir"
                    fallback={true} />
                <hr />
                <CssColorOptions />
                <hr />
                <CssSettingsOption
                    title='Display size'
                    description="Calculated relatively to window size"
                    cssPropName={'display-size'}
                    inputType="range" />

            </DialogContent>
            <DialogActions>
                <Button primary onClick={props.onCancel}>
                    Close
                </Button>
                <Button onClick={performWipe}>
                    Restore defaults
                </Button>
            </DialogActions>
        </Dialog>
    )
}