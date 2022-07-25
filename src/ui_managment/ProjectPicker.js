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
        if(this.view.value === "")
            this.view.value = this.view.getElementsByTagName("option")[0].value

        return "/projects/" + this.view.value;
    }

    async loadProjects() {
        const projects = await this.player.listDirectory("projects");

        for(let i in projects) {
            if(projects[i].type !== "dir") continue;

            let name = projects[i].name;
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