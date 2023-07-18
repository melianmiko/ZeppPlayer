import {ListProjectsRow} from "../types/ServerEntities";
import React from "preact/compat";
import ZeppPlayer from "../../zepp_player/ZeppPlayer";
import {ChromeZeppPlayer} from "../../zepp_player/ChromeZeppPlayer";
import {ProjectPicker} from "../../ui_managment/ProjectPicker";


export function OverviewCard(props: ListProjectsRow & {onCancel: () => any}) {
    const player = new ChromeZeppPlayer();
    const ref = React.createRef<HTMLCanvasElement>();
    player.config.persistentKeyName = "disabled";
    player.profileName = localStorage.zp_profile_name;

    const rebuildPreview = async () => {
        await player.setProject(props.url);
        await player.init();

        const canvas = await player.render();
        ref.current.getContext("2d").drawImage(canvas, 0, 0);

        await fetch(`${props.url}/preview_${player.profileName}.png`, {
            method: "PUT",
            body: await (await fetch(canvas.toDataURL("image/png"))).blob()
        })
    };

    const changeProject = () => {
        ProjectPicker.applyProjectUrl(props.url);
        props.onCancel();
    };

    return (
        <div onClick={changeProject} className="zp-overview__card">
            <img src={`${props.url}/preview_${player.profileName}.png`}
                 onError={rebuildPreview}
                 alt="" />
            <canvas width={player.profileData.screenWidth}
                 height={player.profileData.screenHeight}
                 ref={ref} />
            <span>{props.title}</span>
        </div>
    )
}