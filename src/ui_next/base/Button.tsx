import React from "preact/compat";

import "./Button.css";

export type ButtonProps = React.PropsWithChildren<{
    onClick?: (e: any) => any,
    primary?: boolean,
}>;

export function Button(props: ButtonProps) {
    let classes = "ui-button";
    if(props.primary) classes += " ui-button--primary";

    return (
        <span class={classes} onClick={props.onClick}>
            {props.children}
        </span>
    )
}
