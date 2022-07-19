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
        if(delay <= 0) return;

        const player = this.player;
        const id = this.timers.length;
        const ctx = this;

        this.timers[id] = {
            timeout: -1,
            interval: -1,
            func: callable,
            delay: delay,
            period: period
        };

        ctx.timers[id].timeout = setTimeout(() => {
            callable.apply(this, option);
            if(period > 0) {
                ctx.timers[id].interval = setInterval(() => {
                    if(player.uiPause) return;
                    callable.apply(this, option);
                }, period);
            }
        }, delay);

        return id;
    }
    
    stopTimer(timerID) {
        if(this.timers[timerID] === null) return;
        if(this.timers[timerID].timeout > -1) 
            clearTimeout(this.timers[timerID].timeout);
        if(this.timers[timerID].interval > -1)
            clearInterval(this.timers[timerID].interval);
        
        this.timers[timerID] = null;
    }
}