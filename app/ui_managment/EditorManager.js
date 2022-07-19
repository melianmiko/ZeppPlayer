export class EditorManager {
    view = document.getElementById("view_edit");
    groupViews = {};

    static init(player) {
        new EditorManager(player);
    }

    constructor(player) {
        this.player = player;

        for(var a in player._deviceState) {
            const data = player._deviceState[a];
            const group = data.groupIcon ? data.groupIcon : "inventory_2";
            const groupView = this.getGroupView(group);

            let row = this.makeField(a, player._deviceState[a], player);
            groupView.appendChild(row);
        }
    }

    getGroupView(group) {
        if(this.groupViews[group]) return this.groupViews[group];

        const view = document.createElement("div");
        view.innerHTML = `<span class="group_icon material-symbols-outlined">${group}</span>`;
        this.view.appendChild(view);

        const content = document.createElement("div");
        content.className = "contents";
        view.appendChild(content);

        this.groupViews[group] = content;
        return content;
    }

    makeField(name, data, player) {
        const row = document.createElement("div");
        row.className = "editor_item"
        const title = document.createElement("h3");
       
        const prettyName = name.charAt(0).toUpperCase() + 
            name.slice(1).replaceAll("_", " ").toLowerCase();

        title.innerText = data.displayName ? data.displayName : prettyName;
        title.onclick = () => alert(data.info);
        row.appendChild(title);
        
        let edit;
        if(data.type === "select") {
            edit = document.createElement('select');
            for(let i in data.options) {
                const o = document.createElement("option");
                o.innerText = data.options[i];
                edit.appendChild(o);
            }
        } else {
            edit = document.createElement('input');
            edit.type = "number";
            if(data.type == "string") edit.type = "text";
            if(data.type == "boolean") edit.type = "checkbox";
        }

        edit.value = data.value;
        edit.checked = data.value;

        // Prevent player hotkey trigger.
        edit.addEventListener("keypress", (e) => {
            e.stopPropagation();
        });

        const maxLength = 14 * (data.maxLength ? data.maxLength : 1) + 14;
        if(data.type != "boolean") edit.style.width = maxLength + "px";

        row.appendChild(edit);
    
        edit.onchange = () => {
            if(data.type != "boolean") return;
            player.setDeviceState(name, edit.checked);
        };
        edit.oninput = () => {
            player.setDeviceState(name, edit.value);
        }
    
        return row;
    }
}