import React from "preact/compat";
import {Backdrop, BackdropProps} from "./Backdrop";

import "./Modal.css";

export type ModalProps = React.PropsWithChildren<BackdropProps & {
    maxWidth?: string|number,
    minWidth?: string|number,
}>;

export function Dialog(props: ModalProps) {
    const onMouseUp = (e: any) => e.stopPropagation();

    return (
        <Backdrop {...props}>
            <div class="ui-modal"
                 onMouseUp={onMouseUp}
                 style={{maxWidth: props.maxWidth || "80vw", minWidth: props.minWidth}}>

                {props.children}

            </div>
        </Backdrop>
    )
}

export function DialogTitle(props: React.PropsWithChildren<{}>) {
    return (
        <div class="ui-modal__title">
            {props.children}
        </div>
    )
}

export type DialogContentProps = {
    noMargin?: boolean
}

export function DialogContent(props: React.PropsWithChildren<DialogContentProps>) {
    let classes = "ui-modal__content";
    if(!props.noMargin) classes += " ui-modal__content--margin";

    return (
        <div class={classes}>
            {props.children}
        </div>
    )
}

export function DialogActions(props: React.PropsWithChildren<{}>) {
    return (
        <div class="ui-modal__actions">
            {props.children}
        </div>
    )
}
