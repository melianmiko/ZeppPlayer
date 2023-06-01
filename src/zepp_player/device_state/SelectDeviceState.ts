import {DeviceStateEntry} from "./DeviceStateEntry";
import ZeppPlayer from "../ZeppPlayer";

export class SelectDeviceState extends DeviceStateEntry<string> {
    options: string[] = [];

    constructor(overrides?: Partial<SelectDeviceState>) {
        super(overrides);
        if(overrides) Object.assign(this, overrides);
    }
    performShift(tick: number, player: ZeppPlayer) {
        const curIndex = this.options.indexOf(this.value);
        const index = (curIndex + 1) % this.options.length;
        this.value = this.options[index];
    }
}