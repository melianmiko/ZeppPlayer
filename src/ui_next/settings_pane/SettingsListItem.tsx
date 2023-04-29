import React from "preact/compat";

import "./SettingsListItem.css";

export type SettingsListItemProps = {
    title: string,
    description: string,
    onClick?: (e: any) => any,
    noClickHandler?: boolean
}

export function SettingsListItem(props: React.PropsWithChildren<SettingsListItemProps>) {
    return (
        <div class="ui-settings-item">
            <div class="ui-settings-item__info">
                <div class="ui-settings-item__title">
                    {props.title}
                </div>
                <div class="ui-settings-item__description">
                    {props.description}
                </div>
            </div>
            <div class="ui-settings-item__content">
                {props.children}
            </div>
            {!props.noClickHandler && <div className="ui-settings-item__click-handler" onClick={props.onClick}/>}
        </div>
    )
}
