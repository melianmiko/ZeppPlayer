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

export default class ExplorerManager {
    static reloadWidgets = document.getElementById("explorer_reload_widgets");
    static reloadTimers = document.getElementById("explorer_reload_timers");
    static view = document.getElementById("explorer_data");
    static player = null;

    static init(player) {
        ExplorerManager.player = player;
        ExplorerManager.reloadWidgets.onclick = ExplorerManager.doReloadWidgets;
        ExplorerManager.reloadTimers.onclick = ExplorerManager.doReloadTimers;
    }

    static doReloadWidgets() {
        ExplorerManager.view.innerHTML = "";
        ExplorerManager.addWidgetsArray(ExplorerManager.player.currentRuntime.widgets, ExplorerManager.view);
    }

    static doReloadTimers() {
        const timers = ExplorerManager.player.currentRuntime.env.timer.timers;
        ExplorerManager.view.innerHTML = "";

        for(let i in timers) {
            if(timers[i] === null) continue;
            const data = timers[i];
            const widgetView = document.createElement("details");

            const header = document.createElement("summary");
            let preview = data.func.name;
            if(!preview) preview = data.func.toString().substring(0, 48) + "...";
            header.innerHTML = "Timer ID" + i.toString();
            header.innerHTML += " <aside>" + preview + "</aside>";
            widgetView.appendChild(header);

            const row1 = document.createElement("div");
            row1.className = "prop_row";
            row1.innerHTML = `<strong>Delay</strong><span>${data.delay}</span>`;
            widgetView.append(row1);

            const row2 = document.createElement("div");
            row2.className = "prop_row";
            row2.innerHTML = `<strong>Period</strong><span>${data.period}</span>`;
            widgetView.append(row2);

            ExplorerManager.view.appendChild(widgetView);
        }
    }

    static addWidgetsArray(widgets, root) {
        for(let i in widgets) {
            ExplorerManager.addWidget(widgets[i], root);
        }
    }

    static addWidget(widget, root) {
        const widgetView = document.createElement("details");
        const header = document.createElement("summary");
        widgetView.appendChild(header);

        // Title
        const [title, subtitle, subtitleClass] = widget.playerWidgetIdentify();

        header.innerHTML = title + " <aside class='" + subtitleClass + "'>" + subtitle + "</aside>";

        if(widget.config.visible === false || widget.config.visible === 0)
            widgetView.style.opacity = 0.5;

        // Config
        for(let prop in widget.config) {
            if(prop.startsWith("_")) continue;

            const row = document.createElement("div");
            row.className = "prop_row";
            row.innerHTML = `<strong>${prop}</strong><span>${widget.config[prop]}</span>`;
            row.onclick = ExplorerManager.makePropEditFunc(widget, prop);
            widgetView.appendChild(row);
        }

        if(widget.config.__content) 
            ExplorerManager.addWidgetsArray(widget.config.__content, widgetView);

        widgetView.appendChild(document.createElement("br"));

        root.appendChild(widgetView);
    }

    static makePropEditFunc(widget, prop) {
        return () => {
            const current = widget.config[prop];
            const input = prompt("Change prop", JSON.stringify(current));
            if(input === null || input === current) return;

            const data = {};
            data[prop] = JSON.parse(input);

            widget.setProperty("more", data);
            ExplorerManager.doReloadWidgets();
        }
    }
}