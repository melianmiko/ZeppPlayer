import { BaseWidget } from "./BaseWidget.js";
import { ImageWidget, TextImageWidget } from "./ImagingWidgets.js";

/**
 * hmUI.widget.DATE_POINTER
 *
 * NOT TESTED
 */
export class DatePointer extends BaseWidget {
    constructor(config) {
        super(config);
        console.info("WIDGET DatePointer NOT TESTED, TEST ME PLS");
    }

    async render(canvas, player) {
        const config = this.conf;

        let angle = 360 * player.getDeviceState(config.type, "progress");

        const pointer = await player.getAssetImage(config.src);
        ImageWidget.draw(pointer, canvas, {
            center_x: config.center_x,
            center_y: config.center_y,
            pos_x: config.center_x - config.posX,
            pos_y: config.center_y - config.posY,
            angle
        });

        if (config.cover_path) {
            const cover = await player.getAssetImage(config.cover_path);
            ImageWidget.draw(cover, canvas, {
                x: config.cover_x,
                y: config.cover_y
            });
        }
    }
}

/**
 * hmUI.widget.TIME_POINTER
 */
 export class TimePointer extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;

        const data = [
            ["hour_", player.getDeviceState("HOUR", "progress")],
            ["minute_", player.getDeviceState("MINUTE", "progress")],
            ["second_", player.getDeviceState("SECOND", "progress")],
        ];

        for(var i in data) {
            const [prefix, value] = data[i];
            let img;

            if(config[prefix + "path"]) {
                img = await player.getAssetImage(config[prefix + "path"]);
                ImageWidget.draw(img, canvas, {
                    center_x: config[prefix + "centerX"],
                    center_y: config[prefix + "centerY"],
                    pos_x: config[prefix + "centerX"] - (config[prefix + "posX"]),
                    pos_y: config[prefix + "centerY"] - (config[prefix + "posY"]),
                    angle: 360 * (180 + value)
                });
            }

            if(config[prefix + "cover_path"]) {
                img = await player.getAssetImage(config[prefix + "cover_path"]);
                ImageWidget.draw(img, canvas, {
                    x: config[prefix + "cover_x"],
                    y: config[prefix + "cover_y"]
                });
            }
        }
    }
}

/**
 * hmUI.widget.IMG_TIME
 * 
 * Fully implemented
 */
 export class TimeWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;

        const ctx = canvas.getContext("2d");
        const timeParts = [
            ["hour_", "HOUR"],
            ["minute_", "MINUTE"],
            ["second_", "SECOND"]
        ];

        let images = [];
        for(var i in timeParts) {
            let [prefix, value] = timeParts[i];
            if(!config[prefix + "array"]) continue;

            value = player.getDeviceState(value, "string");
            if(config[prefix + "zero"] > 0) value = value.padStart(2, "0");
            
            const basementImg = await player.getAssetImage(config[prefix + "array"][0]);
            const img = await TextImageWidget.draw(player, value, 1, {
                font_array: config[prefix + "array"],
                h_space: config[prefix + "space"],
                unit_sc: config[prefix + "unit_sc"],
                unit_tc: config[prefix + "unit_tc"],
                unit_en: config[prefix + "unit_en"],
                align: config[prefix + "align"]
            });

            if(img === null) continue;
            if(config[prefix + "follow"] > 0) {
                let [lastImg, lastPrefix, expectedWidth] = images.pop();

                let offset = config[lastPrefix + "space"];
                if(!offset) offset = 0;
                const combinedImg = player.newCanvas();
                combinedImg.width = lastImg.width + img.width + offset;
                combinedImg.height = Math.max(lastImg.height, img.height);
                const cctx = combinedImg.getContext("2d");
                cctx.drawImage(lastImg, 0, 0);
                cctx.drawImage(img, lastImg.width + offset, 0);
                
                expectedWidth += 2 * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await player.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }
                
                images.push([combinedImg, lastPrefix, expectedWidth]);
            } else {
                const offset = config[prefix + "space"];
                let expectedWidth = 2 * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await player.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }

                images.push([img, prefix, expectedWidth]);
            }
        }

        for(var i in images) {
            const [img, prefix, expWidth] = images[i];
            let x = config[prefix + "startX"];
            let y = config[prefix + "startY"];
            let px = 0;
            switch(config[prefix + "align"]) {
                case "center_h":
                    px = Math.max(0, (expWidth - img.width) / 2);
                    break;
                case "right":
                    px = expWidth - img.width;
            }

            ctx.drawImage(img, x + px, y);
            this.dropEvents(player, [
                x, y, x + img.width, y + img.height
            ])
        }

        // AM\PM
        const ampmState = player.getDeviceState("AM_PM");
        const lang = player.language;
        const ampmData = ["am", "pm"];

        for(var i in ampmData) {
            let value = ampmData[i];
            let prefix = value + "_", 
                langPrefix = prefix + lang + "_";

            if(config[langPrefix + "path"] && ampmState == value) {
                const img = await player.getAssetImage(config[langPrefix + "path"]);
                ctx.drawImage(img, config[prefix + "x"], config[prefix + "y"]);
                this.dropEvents(player, [
                    config[prefix + "x"],
                    config[prefix + "y"],
                    config[prefix + "x"] + img.width,
                    config[prefix + "y"] + img.height
                ]);
            }
        }
    }
}

/**
 * hmUI.widget.IMG_DATE
 * 
 * Fully implemented
 */
export class DateWidget extends BaseWidget {
    async render(canvas, player) {
        const ctx = canvas.getContext("2d");

        const lang = player.language;
        const config = this.config;
        const data = [
            ["year_", player.getDeviceState("YEAR", "string"), 2],
            ["month_", player.getDeviceState("MONTH", "string"), 2],
            ["day_", player.getDeviceState("DAY", "string"), 2]
        ];

        let images = [];
        for(var i in data) {
            let [prefix, value, fullLength] = data[i];
            if(!config[prefix + lang + "_array"]) continue;
            const imgs = config[prefix + lang + "_array"];

            const basementImg = await player.getAssetImage(imgs[0]);
            let img = null;
            if(config[prefix + "is_character"]) {
                try {
                    img = await player.getAssetImage(imgs[value - 1]);
                } catch (e) {
                    continue;
                }
            } else {
                value = value.toString();
                if(config[prefix + "zero"]) 
                    value = value
                        .padStart(fullLength, "0")
                        .substring(value.length - fullLength, value.length);

                img = await TextImageWidget.draw(player, value, 1, {
                    font_array: config[prefix + lang + "_array"],
                    h_space: config[prefix + "space"],
                    unit_sc: config[prefix + "unit_sc"],
                    unit_tc: config[prefix + "unit_tc"],
                    unit_en: config[prefix + "unit_en"],
                    align: config[prefix + "align"]
                });
            }

            if(!img) continue;
            if(config[prefix + "follow"] > 0) {
                let [lastImg, lastPrefix, expectedWidth] = images.pop();

                let offset = config[lastPrefix + "space"];
                if(!offset) offset = 0;
                const combinedImg = player.newCanvas();
                combinedImg.width = lastImg.width + img.width + offset;
                combinedImg.height = Math.max(lastImg.height, img.height);
                const cctx = combinedImg.getContext("2d");
                cctx.drawImage(lastImg, 0, 0);
                cctx.drawImage(img, lastImg.width + offset, 0);
                
                expectedWidth += fullLength * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await player.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }
                
                images.push([combinedImg, lastPrefix, expectedWidth]);
            } else {
                const offset = config[prefix + "space"];
                let expectedWidth = fullLength * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await player.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }

                images.push([img, prefix, expectedWidth]);
            }
        }

        for(var i in images) {
            const [img, prefix, expWidth] = images[i];
            let x = config[prefix + "startX"];
            let y = config[prefix + "startY"];
            let px = 0;
            switch(config[prefix + "align"]) {
                case "center_h":
                    px = Math.max(0, (expWidth - img.width) / 2);
                    break;
                case "right":
                    px = expWidth - img.width;
            }

            ctx.drawImage(img, x + px, y);
            this.dropEvents(player, [
                x, y, x + img.width, y + img.height
            ])
        }
    }
}

/**
 * hmUI.widget.IMG_WEEK
 * 
 * Fully implemented
 */
 export class WeekdayWidget extends BaseWidget {
    async render(canvas, player) {
        const config = this.config;

        let val = player.getDeviceState("WEEKDAY");
        let font = config["week_" + player.language];
        if(!font || val >= font.length) return;

        const img = await player.getAssetImage(font[val]);
        canvas.getContext('2d').drawImage(img, config.x, config.y);
        this.dropEvents(player, [
            config.x, 
            config.y, 
            config.x + img.width, 
            config.y + img.height
        ]);
    }
}
