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

export default class TimerMock {
    constructor(runtime) {
        this.runtime = runtime;
        this.timers = [];

        runtime.onDestroy.push(() => {
            for(var a in this.timers) try {
                this.stopTimer(a);
            } catch(e) {};
        })
    }

    createTimer(delay, period, callable, option) {
        const runtime = this.runtime;
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
                if(!ctx.timers[id]) return;

                ctx.timers[id].interval = setInterval(() => {
                    if(runtime.uiPause) return;
                    callable.apply(this, option);
                }, period);
            }
        }, Math.max(25, delay));

        return id;
    }
    
    stopTimer(timerID) {
        if(!this.timers[timerID]) return;
        if(this.timers[timerID].timeout > -1) 
            clearTimeout(this.timers[timerID].timeout);
        if(this.timers[timerID].interval > -1)
            clearInterval(this.timers[timerID].interval);
        
        this.timers[timerID] = null;
    }
}
