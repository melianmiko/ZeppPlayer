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

export default class Overlay {
    static maskData = null;
    static mask = null;

    static async draw(player, canvas) {
        if(Overlay.maskData == null) await Overlay.loadMask(player);

        if(canvas.width !== Overlay.mask.width || canvas.height !== Overlay.mask.height) 
            return;

        const ctx = canvas.getContext("2d");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for(let i = 3; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - Overlay.maskData[i];
        }

        ctx.putImageData(imgData, 0, 0);
    }

    static async loadMask(player) {
        const mask = await player.getAssetImage("player_overlay.png", true);
        const maskCanvas = player.newCanvas();
        maskCanvas.width = mask.width;
        maskCanvas.height = mask.height;
        const ctx = maskCanvas.getContext("2d");
        ctx.drawImage(mask, 0, 0);

        Overlay.mask = maskCanvas;
        Overlay.maskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    }
}
