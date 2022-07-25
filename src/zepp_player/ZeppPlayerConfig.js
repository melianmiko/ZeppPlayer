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

export default class ZeppPlayerConfig {
    refresh_required = true;            // Must screen be refreshed
    system_fps = 60;

    _currentRenderLevel = 1;
    _renderEventZones = false;
    _renderWithoutTransparency = true;
    _renderAutoShift = false;
    _renderOverlay = true;
    _renderLanguage = "en";

    withScriptConsole = true;

    get current_level() {
        return this._currentRenderLevel;
    }

    set current_level(val) {
        this._currentRenderLevel = val;
        this.refresh_required = true; 
    }

    get render_overlay() {
        return this._renderOverlay;
    }

    set render_overlay(val) {
        this._renderOverlay = val;
        this.refresh_required = true; 
    }

    get showEventZones() {
        return this._renderEventZones;
    }

    set showEventZones(val) {
        this._renderEventZones = val;
        this.refresh_required = true; 
    }

    get language() {
        return this._renderLanguage;
    }

    set language(val) {
        if(["en", "sc", "tc"].indexOf(val) < 0) throw new Error("Undefined language");
        this._renderLanguage = val;
        this.refresh_required = true; 
    }

    get withoutTransparency() {
        return this._renderWithoutTransparency;
    }

    set withoutTransparency(val) {
        this._renderWithoutTransparency = val;
        this.refresh_required = true; 
    }

    get withShift() {
        return this._renderAutoShift;
    }

    set withShift(val) {
        this._renderAutoShift = val;
        this.refresh_required = true; 
    }
}