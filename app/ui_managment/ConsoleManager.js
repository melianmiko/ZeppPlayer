export class ConsoleManager {
    view = document.getElementById("view_console");

    static init(player) {
        new ConsoleManager(player);
    }

    constructor(player) {
        this.player = player;

        player.onRestart = () => this.wipe();
        player.onConsole = (level, data) => this.write(level, data);
    }

    wipe() {
        this.view.innerHTML = "";
    }

    write(level, data) {
        const div = document.createElement("div");
        const lv = document.createElement("span");
        lv.className = "type";
        lv.innerText = level;
        if(level == "ZeppPlayer") lv.style.color = "#0099ff";
        div.appendChild(lv);

        for(var i in data) {
            let arg = document.createElement("span");
            if(data[i] instanceof Object) {
                arg.innerText = JSON.stringify(data[i]);
            } else {
                arg.innerText = data[i].toString();
            }
            div.appendChild(arg);
        }

        this.view.appendChild(div);
    }
}