import React from "preact/compat";
import {v4} from "uuid";

export type CheckboxProps = {
    id?: string,
    checked?: boolean,
    onChange?: (e: any) => any,
}

export function Checkbox(props: CheckboxProps) {
    const [ident, _] = React.useState(v4());
    return (
        <input id={props.id ? props.id : ident}
               type="checkbox"
               checked={props.checked}
               onChange={props.onChange}/>
    )
}