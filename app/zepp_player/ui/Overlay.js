export default class Overlay {
    static maskData = null;

    static async draw(player, canvas) {
        if(Overlay.maskData == null) await Overlay.loadMask(player);

        const ctx = canvas.getContext("2d");
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for(let i = 3; i < imgData.data.length; i += 4) {
            imgData.data[i] = 255 - Overlay.maskData[i];
        }

        ctx.putImageData(imgData, 0, 0);
    }

    static async loadMask(player) {
        const mask = await player.getAssetImage(player.pathOverlay, true);
        const maskCanvas = player.newCanvas();
        maskCanvas.width = mask.width;
        maskCanvas.height = mask.height;
        const ctx = maskCanvas.getContext("2d");
        ctx.drawImage(mask, 0, 0);
        Overlay.maskData = ctx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
    }
}
