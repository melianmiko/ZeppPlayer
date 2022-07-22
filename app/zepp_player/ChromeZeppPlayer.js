import { PersistentStorage } from "./PersistentStorage.js";
import ZeppPlayer from "./ZeppPlayer.js";

export class ChromeZeppPlayer extends ZeppPlayer {
    pathOverlay = "../../../app/overlay.png";

    constructor() {
        super();
        this.rotation = 0;
    }

    getEvalAdditionalData() {
        return `//# sourceURL=${location.href.substring(0, location.href.length-1)}${this.path_script};`
    }

    setupHTMLEvents(block) {
        this._swipeStartCoords = [0, 0];

        block.onmousedown = (e) => {
            e.preventDefault();
            const [x, y] = this._fetchCoordinates(e);
            this._swipeStartCoords = [x, y];
            this.handleEvent("onmousedown", x, y, {x, y});
        };

        block.onmouseup = (e) => {
            e.preventDefault();
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
        
        return [Math.floor(x), Math.floor(y)];
    }

    _getSwipeState(x, y) {
        const [sx, sy] = this._swipeStartCoords;

        if(sx - x > 30) return "left";
        if(x - sx > 30) return "right";
        if(sy - y > 30) return "top";
        if(y - sy > 30) return "bottom";
        return null;
    }

    /**
     * Load TGA image
     * 
     * @param {string} url URL or path
     * @returns image
     */
     async _loadTGA(url) {
        if(!this.__tga_first_use) {
            this.onConsole("ZeppPlayer", [
                "We're using TGA images loader. This will reduce performance."
            ]);
            this.__tga_first_use = true;
        }

        const tga = TGAImage.imageWithURL(url);
        await tga.didLoad;

        if(tga._colorMapType !== 1 || tga._colorMapDepth !== 32) {
            this.onConsole("SystemWarning", [`TGA file ${url.substring(url.lastIndexOf("/") + 1)} has ` +
                `invalid colormap depth, ${tga._colorMapDepth} != 32. This `+
                `file won't be accepted by ZeppOS.`]);
        }

        return tga.image;
    }

    /**
     * Load app asset file to persistent storage,
     * this will allow you to edit this file.
     * 
     * @param {string} path File path
     */
     getAssetText(path, noprefix=false) {
        if(PersistentStorage.get("appFs", path)) 
            return PersistentStorage.get("appFs", path);

        if(!this._auFlag) {
            this.onConsole("ZeppPlayer", ["Notice that stat/open asset enulation works bad for now, "
                + "becouse we need to fetch file from \"server\". Browser may hang."]);
            this._auFlag = true;
        }

        let url = this.path_project + "/assets/" + path;
        if(noprefix) url = path;
        const rq = new XMLHttpRequest();
        rq.open('GET', url, false);
        rq.send();

        this.onConsole("ZeppPlayer", ["Fetched asset", path]);
        return rq.responseText;
    }

    async getFileContent(path) {
        const resp = await fetch(path);
        const text = await resp.text();
        return text;
    }

    getAssetImage(path, noprefix=false) {
        return new Promise((resolve, reject) => {
            if(this._img_cache[path] === false) {
                reject();
                return
            }

            if(this._img_cache[path]) {
                resolve(this._img_cache[path]);
                return;
            }

            const image = new Image();
            image.onload = () => {
                this._img_cache[path] = image;
                resolve(image);
            };
            image.onerror = () => {
                this._loadTGA(this.path_project + "/assets/" + path).then((image) => {
                    this._img_cache[path] = image;
                    resolve(image);
                }).catch((e) => {
                    console.warn("Failed to fetch image", path);
                    this._img_cache[path] = false;
                    reject();
                })
            };
            image.src = noprefix ? path : this.path_project + "/assets/" + path;
        })
    }
}
