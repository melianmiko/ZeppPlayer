import {DeviceStateEntry} from "./DeviceStateEntry";
import ZeppPlayer from "../ZeppPlayer";

export class StringDeviceState extends DeviceStateEntry<string> {
    performShift(tick: number, player: ZeppPlayer) {
        if(!this.displayConfig.options) return;

        const curIndex = this.displayConfig.options.indexOf(this.value);
        const index = (curIndex + 1) % this.displayConfig.options.length;
        this.value = this.displayConfig.options[index];
    }
}
