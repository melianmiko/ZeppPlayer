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

export class ConsoleManager {
    view = document.getElementById("view_console");

    colors = {
        ZeppPlayer: "#ff7043",
        device: "#96ffa0",
        SystemWarning: "#ff9900",
        ZeppPlayerFatalError: "#ff2222",
        runtime: "#4cf",
        error: "#f22",
        warn: "#ff6600"
    }

    static init(player) {
        new ConsoleManager(player);
    }

    constructor(player) {
        this.player = player;

        player.onConsoleOutput.add((tag, data, extra) => {
            if(tag === "PlayerRestarted") return this.wipe();
            this.writeBrowserConsole(tag, data, extra)
            this.write(tag, data, extra);
        })
    }

    wipe() {
        this.view.innerHTML = "";
    }

    writeBrowserConsole(level, data, extra) {
        const color = this.colors[level] ? this.colors[level] : "initial";
        const id = (extra && extra.runtimeID) ? extra.runtimeID : "";
        const args = [`%c[${level}] %c${id}`, `color: ${color}`, `color: #999`];

        if(['log', 'error', 'warn', 'info'].indexOf(level) > -1) {
            console[level](...args, ...data);
        } else {
            console.log(...args, ...data);
        }
    }

    write(level, data, extra) {
        const div = document.createElement("div");
        const lv = document.createElement("span");
        lv.style.color = this.colors[level] ? this.colors[level] : "#999";
        lv.innerText = level;
        div.appendChild(lv);

        if(extra && extra.runtimeID) {
            let arg = document.createElement("span");
            arg.style.opacity = "0.5";
            arg.innerText = extra.runtimeID;
            div.appendChild(arg);
        }

        for(let i in data) {
            let arg = document.createElement("span");
            if(data[i] instanceof Error) {
                arg.innerText = data[i].stack;
            }else if(data[i] instanceof Object) {
                arg.innerText = JSON.stringify(data[i]);
            } else {
                arg.innerText = data[i].toString();
            }
            div.appendChild(arg);
        }

        this.view.appendChild(div);
        this.view.scrollTop = this.view.scrollHeight;
    }
}