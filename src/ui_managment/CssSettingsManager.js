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
        if(localStorage[`zp_css_${keyName}`]) {
            htmlStyles.setProperty(`--${keyName}`,
                localStorage[`zp_css_${keyName}`]);
            input.value = localStorage[`zp_css_${keyName}`];
        }

        // Change event
        input.onchange = () => {
            console.log("Change color", keyName, input.value);
            localStorage[`zp_css_${keyName}`] = input.value;
        }
    }
}