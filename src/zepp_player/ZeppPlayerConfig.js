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

    _currentRenderLevel = 1;
    _renderEventZones = false;
    _renderWithoutTransparency = true;
    _renderAutoShift = false;
    _renderOverlay = true;
    _renderLanguage = "en";
    _renderScroll = 0;

    withScriptConsole = true;

    get renderScroll() {
        return this._renderScroll;
    }

    set renderScroll(v) {
        this._renderScroll = Math.max(0, v);
        if(this.currentRuntime) this.currentRuntime.refresh_required = true;
    }

    get current_level() {
        return this._currentRenderLevel;
    }

    set current_level(_) {
        throw new Error("Can't set directly, use setRenderLevel()")
    }

    get render_overlay() {
        return this._renderOverlay;
    }

    set render_overlay(val) {
        this._renderOverlay = val;
        if(this.currentRuntime) this.currentRuntime.refresh_required = true;
    }

    get showEventZones() {
        return this._renderEventZones;
    }

    set showEventZones(val) {
        this._renderEventZones = val;
        if(this.currentRuntime) this.currentRuntime.refresh_required = true;
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
        if(this.currentRuntime) this.currentRuntime.refresh_required = true;
    }
}