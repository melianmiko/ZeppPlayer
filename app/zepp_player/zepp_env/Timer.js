export default class TimerMock {
    constructor(player) {
        this.player = player;
        this.timers = [];

        player.onDestroy.push(() => {
            for(var a in this.timers) try {
                clearInterval(this.timers[a])
            } catch(e) {};
        })
    }

    createTimer(delay, period, callable, option) {
        const player = this.player;
        const id = this.timers.length;
        const ctx = this;

        this.timers[id] = -1;

        ctx.timers[id] = setTimeout(() => {
            if(delay > 0) callable.apply(this, option);
            if(period > 0) ctx.timers[id] = setInterval(() => {
                if(player.uiPause) return;
                callable.apply(this, option);
            }, period);
        }, delay);

        return id;
    }
    
    stopTimer(timerID) {
        clearInterval(this.timers[timerID]);
    }
}