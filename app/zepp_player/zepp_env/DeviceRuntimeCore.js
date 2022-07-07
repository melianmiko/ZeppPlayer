export default class DeviceRuntimeCoreMock {
    constructor(player) {
        this.player = player;
    }

    WidgetFactory = class {
        constructor(a1, a2, a3) {}
    }

    HmDomApi = class {
        constructor(a1, a2) {}
    }

    HmLogger = class {
        static getLogger(name) {
            return {
                log: (data) => console.log("hmLogger", "[" + name + "]", data)
            }
        }
    }

    WatchFace(config) {
        this.player.page = config;
    }

    Page(config) {
        this.player.page = config;
    }
}
