import {SettingsListItem, SettingsListItemProps} from "./SettingsListItem";
import {SettingsRowProps} from "./types";
import React from "preact/compat";
import AppSettingsManager from "../../ui_managment/AppSettingsManager";

export type CssSettingsOptionProps = SettingsListItemProps & {
    cssPropName: string,
};

export function CssSettingsOption(props: CssSettingsOptionProps) {
    const configKey = `css_${props.cssPropName}`;
    const [current, setCurrent] = React.useState<string>(AppSettingsManager.getString(configKey, null));

    React.useEffect(() => {
        if(current == null) return;
        document.documentElement.style.setProperty(`--${props.cssPropName}`, current);
        AppSettingsManager.setString(configKey, current);
    })

    return (
        <SettingsListItem title={props.title}
                          description={props.description}
                          noClickHandler>

            <input type="color"
                   value={current}
                   onChange={(e: any) => setCurrent(e.target.value)} />

        </SettingsListItem>
    );
}