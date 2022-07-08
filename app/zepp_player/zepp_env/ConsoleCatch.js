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
        if(this.player.withScriptConsole)
            this.console.log(...arguments);
    }

    info() {
        this._parse("info", arguments);
        if(this.player.withScriptConsole)
            this.console.info(...arguments);
    }

    warn() {
        this._parse("warn", arguments);
        if(this.player.withScriptConsole)
            this.console.warn(...arguments);
    }

    error() {
        this._parse("error", arguments);
        if(this.player.withScriptConsole)
            this.console.error(...arguments);
    }
}
