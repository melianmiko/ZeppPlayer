import React from "preact/compat";

import "./Backdrop.css";

export type BackdropProps = {
    open: boolean,
    onCancel?: (e: any) => any
}

export function Backdrop(props: React.PropsWithChildren<BackdropProps>) {
    if(!props.open) return null;

    return (
        <div class="ui-backdrop" onMouseUp={props.onCancel}>
            {props.children}
        </div>
    );
}