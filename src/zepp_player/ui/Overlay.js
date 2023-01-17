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
    maskData = null;
    mask = null;

    constructor(player) {
        this.player = player;
    }

    /**
     * Preload all contents.
     * @returns {Promise<Overlay>}
     */
    async init() {
        if(!this.player.profileData.hasOverlay) return this;

        const maskFile = await this.player.loadFile(`/app/overlay/${this.player.profileName}.png`);
        const mask = await this.player._loadPNG(maskFile);
        const maskCanvas = this.player.newCanvas();
        maskCanvas.width = mask.width;
        maskCanvas.height = mask.height;
        const ctx = maskCanvas.getContext("2d");
        ctx.drawImage(mask, 0, 0);

        this.mask = maskCanvas;
        this.maskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
        return this;
    }

    async drawEventZones(canvas, eventGroups) {
        const ctx = canvas.getContext("2d");
        ctx.strokeStyle = "rgba(0, 153, 255, 0.5)";
        ctx.lineWidth = 2;

        for(let group of eventGroups) {
            let hasNoNull = false;
            for(let i in group.events) {
                if(group.events[i] !== null) {
                    hasNoNull = true;
                    break;
                }
            }

            if(!hasNoNull) continue;

            const {x1, y1, x2, y2} = group;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        }
    }

    /**
     * Draw device frame overlay
     * @param canvas Target canvas
     * @returns {Promise<void>} nothing
     */
    async drawDeviceFrame(canvas) {
        if(canvas.width !== this.mask.width || canvas.height !== this.mask.height)
            return;

        const ctx = canvas.getContext("2d");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for(let i = 3; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - this.maskData[i];
        }

        ctx.putImageData(imgData, 0, 0);
    }
}
