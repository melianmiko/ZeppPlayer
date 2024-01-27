import {SettingsListItem, SettingsListItemProps} from "./SettingsListItem";
import {SettingsRowProps} from "./types";
import React from "preact/compat";
import AppSettingsManager from "../../ui_managment/AppSettingsManager";

export type CssSettingsOptionProps = SettingsListItemProps & {
    cssPropName: string,
    inputType: "color" | "range"
};

export function transformDidplaySize(value: number): string {
    return (value*0.15+15).toString();
}

export function CssSettingsOption(props: CssSettingsOptionProps) {
    const configKey = `css_${props.cssPropName}`;
    const [current, setCurrent] = React.useState<string>(AppSettingsManager.getString(configKey, null));

    React.useEffect(() => {
        if(current == null) return;
        let value = current;
        if(props.inputType === "range") {
            value = transformDidplaySize(+value);
        }
        document.documentElement.style.setProperty(`--${props.cssPropName}`, value);
        AppSettingsManager.setString(configKey, current);
    })

    return (
        <SettingsListItem title={props.title}
                          description={props.description}
                          noClickHandler>

            <input type={props.inputType}
                   value={current}
                   onChange={(e: any) => setCurrent(e.target.value)} />

        </SettingsListItem>
    );
}