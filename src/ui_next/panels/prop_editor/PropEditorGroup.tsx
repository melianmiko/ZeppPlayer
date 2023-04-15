import React from "preact/compat";

import "./PropEditorGroup.css";

type PropEditorGroupProps = React.PropsWithChildren<{
    icon: string
}>;

export function PropEditorGroup(props: PropEditorGroupProps) {
    return (
        <div class="props-group">
            <span class="props-group__icon material-symbols-outlined">
                {props.icon}
            </span>
            <div class="props-group__content">
                {props.children}
            </div>
        </div>
    )
}