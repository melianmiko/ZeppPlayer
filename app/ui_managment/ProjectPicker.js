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