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

import {ChangesWatcher} from "./ChangesWatcher";
import ZeppPlayer from "../zepp_player/ZeppPlayer";
import AppSettingsManager from "./AppSettingsManager";

export type ProjectRow = {
    title: string,
    url: string,
}

export class ProjectPicker {
    public static projects: ProjectRow[] = [];
    private static view: HTMLSelectElement = document.getElementById("project_select") as HTMLSelectElement;
    private static player: ZeppPlayer;

    static getProject() {
        return ProjectPicker.view.value;
    }

    static async setup(player: ZeppPlayer) {
        const preferBuildDir = AppSettingsManager.getObject("preferBuildDir", true);

        const response = await fetch(`/api/list_projects?preferBuildDir=${preferBuildDir}`);
        const projects = await response.json();
        ProjectPicker.projects = projects;
        ProjectPicker.player = player;

        const availableURLs = [];
        for(const row of projects) {
            const opt = document.createElement("option");
            opt.value = row.url;
            opt.innerText = row.title;
            availableURLs.push(row.url);
            ProjectPicker.view.appendChild(opt);
        }

        // Add "open folder" option
        const opt = document.createElement("option");
        opt.value = "<open_folder>";
        opt.innerText = "<file manager...>";
        ProjectPicker.view.appendChild(opt);

        // Add "change folder" option
        const opt2 = document.createElement("option");
        opt2.value = "<change_folder>";
        opt2.innerText = "<change directory...>";
        ProjectPicker.view.appendChild(opt2);

        // Load current option
        if(localStorage.zepp_player_last_project) {
            const lastProject = localStorage.zepp_player_last_project;
            if(availableURLs.indexOf(lastProject) > -1)
                ProjectPicker.view.value = lastProject;
        }

        // Event handler
        ProjectPicker.view.onchange = async () => {
            if(ProjectPicker.view.value === "<open_folder>") {
                await fetch("/api/open_projects");
                ProjectPicker.view.value = localStorage.zepp_player_last_project;
                return
            } else if(this.view.value === "<change_folder>") {
                (window as any)._setReactPane("change_projects_dir");
                ProjectPicker.view.value = localStorage.zepp_player_last_project;
                return;
            }

            await ProjectPicker.applyProjectUrl(ProjectPicker.view.value);
        };
    }

    static async applyProjectUrl(url: string) {
        localStorage.zepp_player_last_project = url;
        ProjectPicker.view.value = url;
        await ProjectPicker.player.finish();
        await ProjectPicker.player.setProject(ProjectPicker.getProject());
        await ProjectPicker.player.init();
        await ChangesWatcher.onProjectChange(this.player);
    }
}