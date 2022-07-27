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
            for(let a in this.timers) try {
                this.stopTimer(a);
            } catch(e) {}
        })
    }

    createTimer(_, period, callable, option) {
        const runtime = this.runtime;
        const id = this.timers.length;
        const ctx = this;

        if(period === 0) return;

        this.timers[id] = {
            interval: -1,
            func: callable,
            period: period
        };

        ctx.timers[id].interval = setInterval(() => {
            if(runtime.uiPause) return;
            callable.apply(this, option);
        }, Math.max(period, 25));

        return id;
    }
    
    stopTimer(timerID) {
        if(!this.timers[timerID]) return;
        if(this.timers[timerID].interval > -1)
            clearInterval(this.timers[timerID].interval);
        
        this.timers[timerID] = null;
    }
}
