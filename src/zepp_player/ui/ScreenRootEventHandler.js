const DIRECTION_THR = 30;

export class ScreenRootEventHandler {

    constructor(runtime) {
        this.runtime = runtime;
    }

    onwheel(delta) {
        const maxScroll = this.runtime.contentHeight - this.runtime.screen[1];
        if(maxScroll <= 0) return false;

        this.runtime.player.renderScroll = Math.min(maxScroll,
            this.runtime.player.renderScroll + delta);

        return true;
    }

    onmousedown(info) {
        this.startCoords = [info.x, info.y];
        this.direction = 0;
        this.inScroll = false;
        this.performGesture = "";
        this.startScroll = this.runtime.player.renderScroll;
        this.maxScroll = this.runtime.contentHeight - this.runtime.screen[1];
    }

    onmouseup() {
        if(this.performGesture) {
            let response = this.runtime.appGestureHandler(this.direction);
            if(!response && this.direction === "right")
                this.runtime.back();
        }
    }

    onmousemove(info) {
        const {x, y} = info;
        if(!this.direction) {
            if(x - this.startCoords[0] > DIRECTION_THR) {
                this.direction = "right";
            } else if (this.startCoords[0] - x > DIRECTION_THR) {
                this.direction = "left";
            } else if (y - this.startCoords[1] > DIRECTION_THR) {
                this.direction = "down";
                if(this.startScroll > 0) this.inScroll = true;
            } else if(this.startCoords[1] - y > DIRECTION_THR) {
                this.direction = "up";
                if(this.startScroll < this.maxScroll) this.inScroll = true;
            } else return;
        }

        const runtime = this.runtime;
        const player = this.runtime.player;
        if(this.inScroll) {
            player.renderScroll = this.startScroll + (this.startCoords[1] - y);
        } else {
            let delta, target;
            switch(this.direction) {
                case "right":
                    delta = x - this.startCoords[0];
                    target = this.runtime.screen[0];
                    break;
                case "left":
                    delta = this.startCoords[0] - x;
                    target = this.runtime.screen[0];
                    break;
                case "up":
                    delta = this.startCoords[1] - y;
                    target = this.runtime.screen[1];
                    break;
                case "down":
                    delta = y - this.startCoords[1];
                    target = this.runtime.screen[1];
                    break;
            }

            this.performGesture = delta / target > 0.25;
        }
    }
}
