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
        return config;
    }

    Page(config) {
        this.player.page = config;
        return config;
    }
}
