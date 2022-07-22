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

export async function initVersionUI() {
    const pkg = await fetch("/package.json");
    const pkgJson = await pkg.json();
    const APP_VERSION = pkgJson.version;
    
    const view = document.getElementById("version_box");
    const versionDiv = document.createElement("div");
    versionDiv.innerHTML = "<span>ZeppPlayer v" + APP_VERSION + 
        ", by <a href='https://melianmiko.ru' target='_blank'>melianmiko</a></span>";

    view.innerHTML = "";
    view.appendChild(versionDiv);

    // Fetch release info
    let data = {};
    try {
        const resp = await fetch("https://st.melianmiko.ru/zepp_player/release.json");
        data = await resp.json();
    } catch(e) {
        console.warn("Update check failed. You can check manually here https://melianmiko.ru");
        return;
    }

    if(data.version == APP_VERSION) return;

    const updateLink = document.createElement("a");
    updateLink.className = "update";
    updateLink.href = data.website;
    updateLink.target = "_blank";
    updateLink.innerText = "New version is available (v" + data.version + "). Download it now.";
    view.appendChild(updateLink);
}
