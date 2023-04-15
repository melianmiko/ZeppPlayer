import {v4} from "uuid";
import React from "preact/compat";
import {Checkbox, CheckboxProps} from "./Checkbox";

import "./CheckboxWithLabel.css";

export type CheckboxWithLabelProps = CheckboxProps & {
    label?: string,
};

export function CheckboxWithLabel(props: CheckboxWithLabelProps) {
    const [ident, _] = React.useState(v4());

    return (
        <div class="ui-cb-with-label">
            <Checkbox {...props} id={ident} />
            <label htmlFor={ident} class="ui-cb-with-label__label">
                {props.label}
            </label>
        </div>
    )
}