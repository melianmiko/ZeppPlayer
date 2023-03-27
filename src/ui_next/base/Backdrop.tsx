import React from "preact/compat";

import "./Backdrop.css";

type BackdropProps = {
    open: boolean,
}

export function Backdrop(props: React.PropsWithChildren<BackdropProps>) {
    if(!props.open) return null;

    return (
        <div class="ui-backdrop">
            {props.children}
        </div>
    );
}