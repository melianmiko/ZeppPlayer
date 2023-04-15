import {PropsWithPlayer} from "../../types/ReactProps";
import React from "preact/compat";
import {CheckboxWithLabel} from "../../base/CheckboxWithLabel";
import {RealTimeTicker} from "../../../zepp_player/tools/RealTimeTicker";

export function RealTimeSwitch(props: PropsWithPlayer<{}>) {
    function toggle(e: any) {
        e.target.checked ? RealTimeTicker.start(props.player) : RealTimeTicker.stop();
    }

    return (
        <div style={{padding: "0 8px"}}>
            <CheckboxWithLabel onChange={toggle}
                               label="Real-time clock" />
            <hr />
        </div>
    )
}