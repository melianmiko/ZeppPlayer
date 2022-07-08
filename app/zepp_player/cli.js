#!/usr/bin/env node

import { NodeZeppPlayer } from "./NodeZeppPlayer.js";
import * as fs from 'fs';

async function main() {
    let project = process.argv[2];
    let player = new NodeZeppPlayer();
    await player.setProject(project);
    await player.init();
    const o = await player.render();
    fs.writeFileSync("out.png", o.toBuffer());
}

main();
