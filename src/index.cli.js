#!/usr/bin/env node

/*
    ZeppPlayer - ZeppOS, mostly Mi Band 7, simulator for PC
    Copyright (C) 2022  MelianMiko

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { NodeZeppPlayer } from "./zepp_player/NodeZeppPlayer";
import { registerFont } from "canvas";
import GIFEncoder from "gif-encoder-2";
import * as fs from 'fs';

const argv = yargs(hideBin(process.argv))
    .command('<projects...>', 'Preview a list of projects')
    .option('gif', {
        describe: "With GIF preview",
        boolean: true
    })
    .option('stage', {
        describe: "With render stages export (debug feature)",
        boolean: true
    })
    .option('png', {
        describe: "With PNG preview",
        default: true,
        boolean: true
    })
    .option("o", {
        describe: "Output path, {} will be replaced with current project path",
        type: "string",
        default: "{}"
    })
    .parse();

async function createGif(player) {
    const FPS = 5;
    const SECONDS = 4;

    player.render_counter = 0;

    const gif = new GIFEncoder(player.screen[0], player.screen[1]);
    gif.setDelay(Math.round(1000 / FPS));
    gif.start();

    for(let i = 0; i < FPS*SECONDS*2; i++) {
        if(i === FPS*SECONDS) player.setRenderLevel(2);

        const canvas = await player.render();
        gif.addFrame(canvas.getContext("2d"));

        player.performShift(i);
        player.currentRuntime.callDelegates("resume_call");
    }

    gif.finish();

    return gif.out.getData();
}

/**
 * Main CLI function
 */
async function main() {
    let success = 0, fail = 0;

    // Load font
    registerFont(__dirname + "/allfont-Medium.ttf", { family: 'allfont'});

    for(let a in argv._) {
        const project = argv._[a];

        try {
            let player = new NodeZeppPlayer();
            console.info("Processing " + project + "...");
            await player.setProject(project);
            await player.init();

            player.currentRuntime.animMaxFPS = true;
            player.withStagingDump = argv.stage;
    
            let output = argv.o.replace("{}", project);
    
            if(argv.png) {
                console.log("[ZeppPlayer] Rendering PNG...");
                const png = await player.render();
                fs.writeFileSync(output + "/preview.png", png.toBuffer());
                console.log("[ZeppPlayer] PNG saved to: " + output + "/preview.png");
            }

            if(argv.stage) {
                for(let i in player.stages) {
                    fs.writeFileSync(output + "/stage_" + i + ".png", player.stages[i].toBuffer());
                }
            }
            
            if(argv.gif) {
                console.log("[ZeppPlayer] Rendering GIF...");
                const gif = await createGif(player);
                fs.writeFileSync(output + "/preview.gif", gif);
                console.log("[ZeppPlayer] GIF saved to: " + output + "/preview.gif");
            }

            await player.finish();

            success++;
        } catch(e) {
            console.error(e);
            fail++;
        }
    }

    console.log("");
    console.info("Processed: " + success);
    if(fail > 0) console.warn("Failed: " + fail);

    process.exit();
}

main();
