import HuamiSensorMock from "./zepp_env/HuamiSensor.js";
import { ConsoleMock } from "./zepp_env/ConsoleCatch.js";
import DeviceRuntimeCoreMock from "./zepp_env/DeviceRuntimeCore.js";
import HuamiFsMock from "./zepp_env/HuamiFs.js";
import HuamiSettingMock from "./zepp_env/HuamiSetting.js";
import HuamiUIMock from "./ui/HuamiUI.js";
import TimerMock from "./zepp_env/Timer.js";
import { HuamiBLEMock } from "./zepp_env/HuamiBLE.js";
import { HmAppMock } from "./zepp_env/HmAppMock.js";

export function setupEnvironment(player) {
    const object = {};

    // Glob constants
    object.SLEEP_REFERENCE_ZERO = 24 * 60;

    // Base libraries
    object.DeviceRuntimeCore = new DeviceRuntimeCoreMock(player);
    object.hmUI = new HuamiUIMock(player);
    object.hmFS = new HuamiFsMock(player);
    object.hmApp = new HmAppMock();
    object.hmBle = new HuamiBLEMock();
    object.hmSensor = new HuamiSensorMock(player);
    object.hmSetting = new HuamiSettingMock(player);
    object.timer = new TimerMock(player);
    object.console = new ConsoleMock(player, console);
    object.px = (n) => n; // looks like some legacy shit

    // Links
    object.Logger = object.DeviceRuntimeCore.HmLogger;
    object.WatchFace = (conf) => object.DeviceRuntimeCore.WatchFace(conf);

    object.__$$hmAppManager$$__ = {
        currentApp: {
            pid: 10,
            current: {},
            app: {
                __globals__: {}
            }
        }
    };
    object.__$$module$$__ = {};

    return object;
}
