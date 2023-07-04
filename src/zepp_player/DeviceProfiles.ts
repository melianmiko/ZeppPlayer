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
}

export class DeviceProfiles {
    sb7: DeviceInfo = {
        hasOverlay: true,
        screenWidth: 192,
        screenHeight: 490,
        deviceName: "Xiaomi Smart Band 7",
        deviceSource: 260,
        enablePropBanList: true,
    };

    ab7: DeviceInfo = {
        hasOverlay: true,
        screenWidth: 194,
        screenHeight: 368,
        deviceName: "Amazfit Band 7",
        deviceSource: 252,
    };

    gtrmini: DeviceInfo = {
        screenWidth: 416,
        screenHeight: 416,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "GTR mini",
        deviceSource: 250,
    };

    gtr3: DeviceInfo = {
        screenWidth: 454,
        screenHeight: 454,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "GTR 3",
        deviceSource: 226,
    };

    gtr3pro: DeviceInfo = {
        screenWidth: 480,
        screenHeight: 480,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "GTR 3 pro",
        deviceSource: 229,
    };

    gtr4: DeviceInfo = {
        screenWidth: 466,
        screenHeight: 466,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "GTR 4",
        deviceSource: 7930112,
    };

    gts4: DeviceInfo = {
        screenWidth: 390,
        screenHeight: 450,
        hasOverlay: true,
        swapRedAndBlueTGA: true,
        deviceName: "GTS 4",
        deviceSource: 7995648,
    };

    gts4mini: DeviceInfo = {
        screenWidth: 336,
        screenHeight: 384,
        hasOverlay: true,
        deviceName: "Amazfit GTS 4 Mini",
        deviceSource: 246,
        defaultFontSize: 12,
    };

    trexultra: DeviceInfo = {
        screenWidth: 454,
        screenHeight: 454,
        circleScreen: true,
        deviceName: "",
        deviceSource: 6553856,
    };

    trex2: DeviceInfo = {
        screenWidth: 454,
        screenHeight: 454,
        circleScreen: true,
        deviceName: "",
        deviceSource: 418,
    };

    falcon: DeviceInfo = {
        screenWidth: 416,
        screenHeight: 416,
        circleScreen: true,
        deviceName: "",
        deviceSource: 414,
    };

    cheetah: DeviceInfo = {
        screenWidth: 454,
        screenHeight: 454,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "",
        deviceSource: 8192256,
    };

    cheetah_pro: DeviceInfo = {
        screenWidth: 480,
        screenHeight: 480,
        circleScreen: true,
        swapRedAndBlueTGA: true,
        deviceName: "",
        deviceSource: 8126720,
    };
}
