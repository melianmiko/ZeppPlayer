export default class ExplorerManager {
    static button = document.getElementById("explorer_reload");
    static view = document.getElementById("explorer_data");
    static player = null;

    static init(player) {
        ExplorerManager.player = player;
        ExplorerManager.button.onclick = ExplorerManager.refresh;
    }

    static refresh() {
        ExplorerManager.view.innerHTML = "";
        ExplorerManager.addArray(ExplorerManager.player.widgets, ExplorerManager.view);
    }

    static addArray(widgets, root) {
        for(let i in widgets) {
            ExplorerManager.addWidget(widgets[i], root);
        }
    }

    static addWidget(widget, root) {
        const widgetView = document.createElement("details");
        const header = document.createElement("summary");
        widgetView.appendChild(header);

        // Title
        let title = widget.config.__widget;
        let subtitle = "", subtitleClass = "";
        if(widget.config._name) {
            subtitle = widget.config._name;
            subtitleClass = "userDefined";
        } else if(widget.config.type) {
            subtitle = widget.config.type;
        } else if(widget.config.src) {
            subtitle = widget.config.src;
        } else if(widget.config.text) {
            subtitle = widget.config.text;
        }

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
            ExplorerManager.addArray(widget.config.__content, widgetView);

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
            ExplorerManager.refresh();
        }
    }
}