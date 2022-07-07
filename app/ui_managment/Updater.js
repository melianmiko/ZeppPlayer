import APP_VERSION from "../version.js";

export async function initVersionUI() {
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
