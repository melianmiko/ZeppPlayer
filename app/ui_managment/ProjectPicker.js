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

export class ProjectPicker {
    view = document.getElementById("project_select");

    constructor(player) {
        this.player = player;
    }

    getProject() {
        if(this.view.value == "") 
            this.view.value = this.view.getElementsByTagName("option")[0].value

        const proj = "/projects/" + this.view.value;
        return proj;
    }

    startAutoReload() {
        const player = this.player;

        setInterval(async () => {
            if(document.hidden) return;
            const resp = await fetch(player.url_script);
            const data = await resp.text();
            if(data != player.script_data) location.reload();        
        }, 5000);
    }

    async loadProjects() {
        const resp = await fetch("/projects");
        const html = await resp.text();
    
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
    
        const links = Array.from(doc.getElementsByTagName("a"));
        for(var a in links) {
            let name = links[a].innerText;
            if(!name[name.length-1] == "/") continue;
            name = name.substring(0, name.length-1);
    
            const opt = document.createElement("option");
            opt.value = name;
            opt.innerText = name;
            this.view.appendChild(opt);
        }
    
        if(localStorage.zepp_player_last_project) {
            this.view.value = localStorage.zepp_player_last_project;
        }
    
        this.view.onchange = () => {
            localStorage.zepp_player_last_project = this.view.value;
            location.reload();
        };
    }
}