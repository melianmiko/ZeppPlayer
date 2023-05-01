import {DeviceStateEntry} from "./DeviceStateEntry";
import ZeppPlayer from "../ZeppPlayer";

export class BooleanDeviceState extends DeviceStateEntry<boolean> {
    shiftTickCount: number = 1;

    constructor(overrides: Partial<BooleanDeviceState>) {
        super();
        Object.assign(this, overrides);
    }

    getNumber(player: ZeppPlayer): number {
        return this.value ? 1 : 0;
    }

    getProgress(player: ZeppPlayer): number {
        return this.getNumber(player);
    }

    performShift(tick: number, player: ZeppPlayer) {
        if(tick % this.shiftTickCount != 0) return;
        this.value = !this.value
    }
}