import React from "preact/compat";
import {CommandPaletteContext} from "./CommandPalette";

/**
 * Command palette item props
 */
export type PaletteItemProps = {
    value: string,
    children: string
}

/**
 * Command palette item
 * @param props props
 * @constructor
 */
export function CommandPaletteItem(props: PaletteItemProps) {
    const ctx = React.useContext(CommandPaletteContext);
    const ref = React.useRef<HTMLDivElement>();

    let cn = "ui-command-palette__items__item";
    if(ctx.value == props.value) cn += " ui-command-palette__items__item--active"

    React.useEffect(() => {
        if(!ref.current) return;

        if(ctx.value == props.value)
            ref.current.scrollIntoView(false);
    })

    return (
        <div className={cn} ref={ref} onClick={() => ctx.onSelect(props.value)}>
            {props.children}
        </div>
    );
}
