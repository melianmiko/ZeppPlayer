import zeppDevices from "../data/zepp_devices.json";

export type DeviceInfo = {
    screenWidth: number;
    screenHeight: number;
    deviceName: string;
    deviceSource?: number;
    hasOverlay?: boolean;
    circleScreen?: boolean;
    enablePropBanList?: boolean;
    swapRedAndBlueTGA?: boolean;
    defaultFontSize?: number,
    useAbsolutePathsInHuamiFS?: boolean,
}

export function getDeviceProfiles(): { [p: string]: DeviceInfo } {
    const devices: {[id: string]: DeviceInfo} = {};

    for(const row of zeppDevices) {
        devices[row.id] = {
            circleScreen: row.screenShape == "round",
            deviceName: row.deviceName,
            deviceSource: row.deviceSource[0],
            screenHeight: row.screenHeight,
            screenWidth: row.screenWidth,
            hasOverlay: ["mi_band7", "band7", "gts4", "gts4mini"].indexOf(row.id) > -1,
            swapRedAndBlueTGA: ["mi_band7", "band7", "gts4mini"].indexOf(row.id) < 0,
            defaultFontSize: row.id == "gts4mini" ? 12 : null,
            enablePropBanList: row.id == "mi_band7",
            useAbsolutePathsInHuamiFS: row.id == "mi_band7",
        }
    }

    return devices;
}
