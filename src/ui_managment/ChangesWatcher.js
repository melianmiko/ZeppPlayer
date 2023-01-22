export class ChangesWatcher {
    static lastChangesCount = "";
    static async init(player) {
        await ChangesWatcher.onProjectChange(player);

        setInterval(async () => {
            if(await ChangesWatcher.isChanged()) {
                await player.restart();
            }
        }, 2500);
    }

    static async onProjectChange(player) {
        const projectName = player.projectPath.substring(10);
        await fetch("/api/watch/" + projectName);
        await ChangesWatcher.isChanged();
    }

    static async isChanged() {
        const resp = await fetch("/api/change_count");
        const value = await resp.text();
        const result = value !== ChangesWatcher.lastChangesCount;
        ChangesWatcher.lastChangesCount = value;

        if(result) {
            console.info("Detect changes in proj", value);
        }

        return result;
    }
}