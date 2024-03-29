import { getDeviceProfiles } from "../../zepp_player/DeviceProfiles";
import { CommandPaletteItem } from "../palette/CommandPaletteItem";

export function getChangeProfileCommands(onCancel: () => any) {
    function applyProfile(name: string) {
        const picker = document.getElementById("player_profile_select") as HTMLSelectElement;
        picker.value = name;
        picker.onchange(null);
        onCancel();
    }

    const profiles = getDeviceProfiles();
    return Object.keys(profiles).map((name) => (
        <CommandPaletteItem value={`profile_${name}`} onSelect={() => applyProfile(name)}>
            {`Set profile: ${name}`}
        </CommandPaletteItem>
    ))
}
