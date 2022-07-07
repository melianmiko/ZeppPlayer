export class EditorManager {
    view = document.getElementById("view_edit");

    static init(player) {
        new EditorManager(player);
    }

    constructor(player) {
        this.player = player;

        for(var a in player._deviceState) {
            let row = this.makeField(a, player._deviceState[a], player);
            this.view.appendChild(row);
        }
    }

    makeField(name, data, player) {
        const row = document.createElement("div");
        const title = document.createElement("h3");
        const infoBtn = document.createElement("span");
    
        title.innerText = name;
        infoBtn.className = "material-symbols-outlined";
        infoBtn.innerText = "info";
    
        row.appendChild(infoBtn);
        row.appendChild(title);
    
        let edit = document.createElement('input');
        edit.type = "number";
        if(data.type == "string") edit.type = "text";
        if(data.type == "boolean") edit.type = "checkbox";
        edit.value = data.value;
        edit.checked = data.value;
        row.appendChild(edit);
    
        infoBtn.onclick = () => alert(data.info);
    
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