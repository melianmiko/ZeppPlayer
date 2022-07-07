export class ConsoleMock {
    constructor(player, console) {
        this.console = console;
        this.player = player;
    }

    _parse(level, args) {
        this.player.onConsole(level, args);
        if(args[0] instanceof Error) {
            this.player.handleScriptError(args[0]);
        }
    }

    log() {
        this._parse("log", arguments);
        this.console.log(...arguments);
    }

    info() {
        this._parse("info", arguments);
        this.console.info(...arguments);
    }

    warn() {
        this._parse("warn", arguments);
        this.console.warn(...arguments);
    }

    error() {
        this._parse("error", arguments);
        this.console.error(...arguments);
    }
}
