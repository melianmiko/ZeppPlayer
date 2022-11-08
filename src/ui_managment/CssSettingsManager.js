import AppSettingsManager from "./AppSettingsManager";

export function initCssSettings() {
    const htmlStyles = document.documentElement.style;
    const props = [
        "background",
        "foreground",
        "panel",
        "panel-text",
        "editor",
        "editor-text",
        "input",
        "input-text",
        "accent"
    ];

    for(const keyName of props) {
        const input = document.getElementById(`css_${keyName}`);

        // Load current
        const userValue = AppSettingsManager.getString(`css_${keyName}`, false);

        if(userValue !== false) {
            htmlStyles.setProperty(`--${keyName}`, userValue);
            input.value = userValue;
        }

        // Change event
        input.onchange = () => {
            console.log("Change color", keyName, input.value);
            AppSettingsManager.setString(`css_${keyName}`, input.value);
        }
    }
}