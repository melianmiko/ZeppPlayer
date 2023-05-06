import {DeviceStateEntry} from "./DeviceStateEntry";
import ZeppPlayer from "../ZeppPlayer";

export class NumberDeviceState extends DeviceStateEntry<number> {
    maxValue: number = Infinity;
    shiftStep: number = 0;
    shiftTickCount: number = 1;

    constructor(overrides: Partial<NumberDeviceState>) {
        super();
        Object.assign(this, overrides);
    }

    setValue(value: number) {
        this.value = parseFloat(value as any);
    }

    getNumber(player: ZeppPlayer): number {
        return this.value;
    }

    getString(player: ZeppPlayer): string {
        return this.getNumber(player).toString();
    }

    getProgress(player: ZeppPlayer): number {
        return this.getNumber(player) / this.maxValue;
    }

    performShift(tick: number) {
        if(this.shiftStep == 0) return;
        if(tick % this.shiftTickCount != 0) return;
        this.value = (this.value + this.shiftStep) % this.maxValue;
    }
}
