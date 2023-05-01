import ZeppPlayer from "../ZeppPlayer";

export type DeviceStateDisplayConfig = {
    maxLength?: number,
    groupIcon?: string,
    info?: string,
    displayName?: string,
    type?: string,
    options?: string[],
    notEditable?: boolean,
}

export class DeviceStateEntry<T> {
    public readonly displayConfig: DeviceStateDisplayConfig = {};
    value: T;

    constructor(overrides?: Partial<DeviceStateEntry<T>>) {
        if(overrides) Object.assign(this, overrides);
    }

    setValue(value: T) {
        this.value = value;
    }

    getNumber(player: ZeppPlayer): number {
        return 0;
    }

    getProgress(player: ZeppPlayer): number {
        return 0;
    }

    getString(player: ZeppPlayer): string {
        return this.value.toString();
    }

    getBoolean(player: ZeppPlayer): boolean {
        return !!this.value;
    }

    performShift(tick: number, player: ZeppPlayer) {
        // Override me
    }
}