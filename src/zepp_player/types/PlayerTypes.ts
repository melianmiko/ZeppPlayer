export enum DeviceStateFetchType {
    progress = "progress",
    pointer_progress = "pointer_progress",
    string = "string",
    maxLength = "maxLength",
    boolean = "boolean",
}

export type ListDirectoryResponseEntry = {
    name: string,
    type: "file"|"dir",
}

export enum RenderLevel {
    NORMAL = 1,
    AOD = 2,
    SETTINGS = 4,
}

export type PlayerConfig = {
    renderWithoutTransparency: boolean,
    renderDeviceOverlay: boolean,
    enableRTC: boolean,
    renderLevel: RenderLevel,
    renderScroll: number,
    showEventZones: boolean,
    withAutoIncrement: boolean,
    persistentKeyName: string,
}
