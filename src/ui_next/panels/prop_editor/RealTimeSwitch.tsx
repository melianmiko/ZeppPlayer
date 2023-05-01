import {PropsWithPlayer} from "../../types/ReactProps";
import React from "preact/compat";
import {CheckboxWithLabel} from "../../base/CheckboxWithLabel";

export function RealTimeSwitch(props: PropsWithPlayer<{}>) {
    function toggle(e: any) {
        props.player.config.enableRTC = e.target.checked;
    }

    return (
        <div style={{padding: "0 8px"}}>
            <CheckboxWithLabel onChange={toggle}
                               label="Real-time clock" />
            <hr />
        </div>
    )
}