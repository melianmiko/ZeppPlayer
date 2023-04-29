import React from "preact/compat";
import {CssSettingsOption} from "./CssSettingsOption";

export const CSS_OPTIONS: {[id: string]: string} = {
    "accent": "Accent color",
    "background": "Page background color",
    "foreground": "Page text color",
    "panel": "Panels background color",
    "panel-text": "Panels text color",
    "editor": "Editor color",
    "editor-text": "Editor text color",
    "input": "Inputs and buttons background color",
    "input-text": "Inputs and buttons text color",
}

export function CssColorOptions() {
    return (
        <>
            {Object.keys(CSS_OPTIONS).map((key) => <CssSettingsOption
                title={CSS_OPTIONS[key]}
                description=""
                cssPropName={key} />)}
        </>
    )
}