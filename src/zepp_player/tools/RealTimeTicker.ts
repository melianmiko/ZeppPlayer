import ZeppPlayer from "../ZeppPlayer";

export class RealTimeTicker {
    private static player: ZeppPlayer;
    private static timerIdent: number;

    static start(player: ZeppPlayer) {
        RealTimeTicker.player = player;
        RealTimeTicker.onTick();
        RealTimeTicker.timerIdent = setInterval(() => {
            RealTimeTicker.onTick();
        }, 1000);
    }

    private static onTick() {
        const date = new Date();
        RealTimeTicker.player.setDeviceStateMany({
            HOUR: date.getHours(),
            MINUTE: date.getMinutes(),
            SECOND: date.getSeconds(),
            DAY: date.getDate(),
            MONTH: date.getMonth(),
            YEAR: date.getFullYear(),
            WEEKDAY: (date.getDay() + 6) % 7
        });
    }

    static stop() {
        clearInterval(RealTimeTicker.timerIdent);
    }
}
