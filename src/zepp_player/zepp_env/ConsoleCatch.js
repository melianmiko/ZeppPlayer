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

export class ConsoleMock {
    constructor(player, console) {
        this.console = console;
        this.player = player;
    }

    _parse(level, args) {
        try {
            this.player.onConsole(level, args);
        } catch(e) {}
    }

    log() {
        this._parse("log", arguments);
    }

    info() {
        this._parse("info", arguments);
    }

    warn() {
        this._parse("warn", arguments);
    }

    error() {
        this._parse("error", arguments);
    }
}
