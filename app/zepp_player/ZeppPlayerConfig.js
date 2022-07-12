export default class ZeppPlayerConfig {
    refresh_required = true;            // Must screen be refreshed

    _currentRenderLevel = 1;
    _renderEventZones = false;
    _renderWithoutTransparency = true;
    _renderAutoShift = false;
    _renderLanguage = "en";

    withScriptConsole = true;

    get current_level() {
        return this._currentRenderLevel;
    }

    set current_level(val) {
        this._currentRenderLevel = val;
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