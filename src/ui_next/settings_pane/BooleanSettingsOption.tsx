import {SettingsListItem, SettingsListItemProps} from "./SettingsListItem";
import {SettingsRowProps} from "./types";
import React from "preact/compat";
import {Checkbox} from "../base/Checkbox";
import AppSettingsManager from "../../ui_managment/AppSettingsManager";

export type BooleanSettingsOptionProps = SettingsListItemProps & SettingsRowProps<boolean>;

export function BooleanSettingsOption(props: BooleanSettingsOptionProps) {
    const [value, setValue] = React.useState<boolean>(AppSettingsManager.getObject(props.configKey, props.fallback));

    const handler = () => {
        const val = !AppSettingsManager.getObject(props.configKey, props.fallback) as boolean;
        AppSettingsManager.setObject(props.configKey, val);
        console.log(props.configKey, val);
        setValue(val);
        if(props.onChange) props.onChange(val);
    }

    return (
        <SettingsListItem title={props.title}
                          description={props.description}
                          onClick={handler}>
            <Checkbox checked={value} />
        </SettingsListItem>
    )
}