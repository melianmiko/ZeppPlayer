import React from "preact/compat";

import "./Backdrop.css";

export type BackdropProps = {
    open: boolean,
    onCancel?: (e: any) => any
}

export function Backdrop(props: React.PropsWithChildren<BackdropProps>) {
    const [rendered, setRendered] = React.useState<boolean>(false);
    const rootRef = React.createRef<HTMLDivElement>();

    React.useEffect(() => {
        if(props.open) {
            // Render and wait
            if(!rendered) {
                setRendered(true);
                return;
            }

            // Fade in if required
            if(rootRef.current && !rootRef.current.classList.contains("ui-backdrop__visible")) {
                rootRef.current.classList.add("ui-backdrop__visible")
            }
        } else if(!props.open && rendered && rootRef.current.classList.contains("ui-backdrop__visible")) {
            rootRef.current.classList.remove("ui-backdrop__visible");
            setTimeout(() => setRendered(false), 200);
        }
    })

    if(!rendered) return null;
    return (
        <div class="ui-backdrop" ref={rootRef} onMouseUp={props.onCancel}>
            {props.children}
        </div>
    );
}