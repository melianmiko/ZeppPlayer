/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2022  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import HuamiSensorMock from "./zepp_env/HuamiSensor.js";
import { ConsoleMock } from "./zepp_env/ConsoleCatch.js";
import DeviceRuntimeCoreMock from "./zepp_env/DeviceRuntimeCore.js";
import HuamiFsMock from "./zepp_env/HuamiFs.js";
import HuamiSettingMock from "./zepp_env/HuamiSetting.js";
import HuamiUIMock from "./ui/HuamiUI.js";
import TimerMock from "./zepp_env/Timer.js";
import { HuamiBLEMock } from "./zepp_env/HuamiBLE.js";
import { HmAppMock } from "./zepp_env/HmAppMock.js";

export function setupEnvironment(runtime) {
    const object = {};

    // Glob constants
    object.SLEEP_REFERENCE_ZERO = 24 * 60;

    // Base libraries
    object.DeviceRuntimeCore = new DeviceRuntimeCoreMock();
    object.hmUI = new HuamiUIMock(runtime);
    object.hmFS = new HuamiFsMock(runtime);
    object.hmApp = new HmAppMock(runtime);
    object.hmBle = new HuamiBLEMock();
    object.hmSensor = new HuamiSensorMock(runtime);
    object.hmSetting = new HuamiSettingMock(runtime);
    object.timer = new TimerMock(runtime);
    object.console = new ConsoleMock(runtime, console);
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
