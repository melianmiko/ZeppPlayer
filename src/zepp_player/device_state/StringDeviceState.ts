import {DeviceStateEntry} from "./DeviceStateEntry";
import ZeppPlayer from "../ZeppPlayer";

export class StringDeviceState extends DeviceStateEntry<string> {
    shiftOptions: string[] = null;

    constructor(overrides?: Partial<StringDeviceState>) {
        super(overrides);
        if(overrides) Object.assign(this, overrides);
    }

    performShift(tick: number, player: ZeppPlayer) {
        if(!this.shiftOptions) return;

        const curIndex = this.shiftOptions.indexOf(this.value);
        const index = (curIndex + 1) % this.shiftOptions.length;
        this.value = this.shiftOptions[index];
    }
}
