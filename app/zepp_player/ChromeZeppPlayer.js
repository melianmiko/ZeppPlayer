import ZeppPlayer from "./ZeppPlayer.js";

export class ChromeZeppPlayer extends ZeppPlayer {
    constructor() {
        super();
        this.rotation = 0;
    }

    setupHTMLEvents(block) {
        this._swipeStartCoords = [0, 0];

        block.onmousedown = (e) => {
            const [x, y] = this._fetchCoordinates(e);
            this._swipeStartCoords = [x, y];
            this.handleEvent("onmousedown", x, y, {x, y});
        };

        block.onmouseup = (e) => {
            const [x, y] = this._fetchCoordinates(e);
            this.handleEvent("onmouseup", x, y, {x, y});

            const ss = this._getSwipeState(x, y);
            if(ss != null) {
                this.handleEvent("move", x, y, ss);
            }
        };

        block.oncontextmenu = (e) => {
            const [x, y] = this._fetchCoordinates(e);
            console.log("click coords", x, y);
        }
    }

    newCanvas() {
        return document.createElement("canvas");
    }

    _fetchCoordinates(e) {
        const rect = e.target.getBoundingClientRect()
        let x, y;

        switch(this.rotation) {
            case 90:
                x = e.clientY - rect.top;
                y = rect.width - (e.clientX - rect.left);
                break;
            case 180:
                x = rect.width - (e.clientX - rect.left);
                y = rect.height - (e.clientY - rect.top);
                break;
            case 270:
                x = rect.height - (e.clientY - rect.top);
                y = e.clientX - rect.left;
                break;
            default:
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
        }
        
        return [x, y];
    }

    _getSwipeState(x, y) {
        const [sx, sy] = this._swipeStartCoords;

        if(sx - x > 30) return "left";
        if(x - sx > 30) return "right";
        if(sy - y > 30) return "top";
        if(y - sy > 30) return "bottom";
        return null;
    }
}
