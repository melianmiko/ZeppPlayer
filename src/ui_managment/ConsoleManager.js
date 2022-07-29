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

    static init(player) {
        new ConsoleManager(player);
    }

    constructor(player) {
        this.player = player;

        player.onRestart = () => this.wipe();
        player.onConsole = (level, data, extra) => this.write(level, data, extra);
    }

    wipe() {
        this.view.innerHTML = "";
    }

    write(level, data, extra) {
        const div = document.createElement("div");
        const lv = document.createElement("span");
        lv.className = "type " + level;
        lv.innerText = level;
        div.appendChild(lv);

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

        if(extra && extra.runtimeID) {
            let arg = document.createElement("span");
            arg.style.opacity = "0.5";
            arg.innerText = extra.runtimeID;
            div.appendChild(arg);
        }

        this.view.appendChild(div);
        this.view.scrollTop = this.view.scrollHeight;
    }
}