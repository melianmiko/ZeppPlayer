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

import { BaseWidget } from "./BaseWidget.js";
import { ImageWidget, TextImageWidget } from "./ImagingWidgets.js";

/**
 * hmUI.widget.DATE_POINTER
 */
export class DatePointer extends BaseWidget {
    constructor(config) {
        super(config);
    }

    async render(canvas, player) {
        const config = this.config;

        let angle = 360 * player.getDeviceState(config.type, "progress");

        const pointer = await player.getAssetImage(config.src);
        ImageWidget.draw(pointer, canvas, player, {
            x: 0, y: 0, w: canvas.width, h: canvas.height,
            center_x: config.center_x,
            center_y: config.center_y,
            pos_x: config.center_x - config.posX,
            pos_y: config.center_y - config.posY,
            angle
        });

        if (config.cover_path) {
            const cover = await player.getAssetImage(config.cover_path);
            ImageWidget.draw(cover, player, canvas, {
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

        const hourProgress = player.getDeviceState("HOUR", "progress");
        const minuteProgress = player.getDeviceState("MINUTE", "progress");
        const secondProgress = player.getDeviceState("SECOND", "progress")

        const data = [
            ["hour_", hourProgress + (minuteProgress / 12)],
            ["minute_", minuteProgress + (secondProgress / 60)],
            ["second_", secondProgress],
        ];

        for(let i in data) {
            const [prefix, value] = data[i];
            let img;

            if(config[prefix + "path"]) {
                img = await player.getAssetImage(config[prefix + "path"]);
                ImageWidget.draw(img, canvas, player, {
                    x: 0, y: 0, w: canvas.width, h: canvas.height,
                    center_x: config[prefix + "centerX"],
                    center_y: config[prefix + "centerY"],
                    pos_x: config[prefix + "centerX"] - (config[prefix + "posX"]),
                    pos_y: config[prefix + "centerY"] - (config[prefix + "posY"]),
                    angle: 360 * (180 + value)
                });
            }

            if(config[prefix + "cover_path"] && config[prefix + "cover_y"] && config[prefix + "cover_x"]) {
                img = await player.getAssetImage(config[prefix + "cover_path"]);
                ImageWidget.draw(img, canvas, player, {
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
    async render(canvas, runtime) {
        const config = this.config;

        const ctx = canvas.getContext("2d");
        const timeParts = [
            ["hour_", "HOUR"],
            ["minute_", "MINUTE"],
            ["second_", "SECOND"]
        ];

        let images = [];
        for(let i in timeParts) {
            let [prefix, value] = timeParts[i];
            if(!config[prefix + "array"]) continue;

            value = runtime.getDeviceState(value, "string");
            if(config[prefix + "zero"] > 0) value = value.padStart(2, "0");

            let basementImg;
            try {
                basementImg = await runtime.getAssetImage(config[prefix + "array"][0]);
            } catch(e) {
                continue;
            }

            let img;
            try {
                img = await TextImageWidget.draw(runtime, value, 0, {
                    font_array: config[prefix + "array"],
                    h_space: config[prefix + "space"],
                    unit_sc: config[prefix + "unit_sc"],
                    unit_tc: config[prefix + "unit_tc"],
                    unit_en: config[prefix + "unit_en"],
                    align: config[prefix + "align"]
                });
            } catch(e) {
                console.warn(e);
                continue;
            }

            if(img === null) continue;
            if(config[prefix + "follow"] > 0) {
                let [lastImg, lastPrefix, expectedWidth] = images.pop();

                let offset = config[lastPrefix + "space"];
                if(!offset) offset = 0;
                const combinedImg = runtime.newCanvas();
                combinedImg.width = lastImg.width + img.width;
                combinedImg.height = Math.max(lastImg.height, img.height);
                const cctx = combinedImg.getContext("2d");
                cctx.drawImage(lastImg, 0, 0);
                cctx.drawImage(img, lastImg.width, 0);
                
                expectedWidth += 2 * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await runtime.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }
                
                images.push([combinedImg, lastPrefix, expectedWidth]);
            } else {
                let offset = config[prefix + "space"];
                if(!offset) offset = 0;
                let expectedWidth = 2 * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    try {
                        let unit = await runtime.getAssetImage(config[prefix + "unit_en"]);
                        expectedWidth += unit.width;
                    } catch(e) {}
                }

                images.push([img, prefix, expectedWidth]);
            }
        }

        for(let i in images) {
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
        }

        // AM\PM
        const ampmState = runtime.getDeviceState("AM_PM");
        const lang = runtime.language;
        const ampmData = ["am", "pm"];

        for(let i in ampmData) {
            let value = ampmData[i];
            let prefix = value + "_", 
                langPrefix = prefix + lang + "_";

            if(config[langPrefix + "path"] && ampmState === value) {
                const img = await runtime.getAssetImage(config[langPrefix + "path"]);
                ctx.drawImage(img, config[prefix + "x"], config[prefix + "y"]);
            }
        }

        this.dropEvents(runtime, [
            0, 0, canvas.width, canvas.height
        ])
    }
}

/**
 * hmUI.widget.IMG_DATE
 * 
 * Fully implemented
 */
export class DateWidget extends BaseWidget {
    async render(canvas, runtime) {
        const ctx = canvas.getContext("2d");

        const lang = runtime.language;
        const config = this.config;
        const data = [
            ["year_", runtime.getDeviceState("YEAR", "string"), 2],
            ["month_", runtime.getDeviceState("MONTH", "string"), 2],
            ["day_", runtime.getDeviceState("DAY", "string"), 2]
        ];

        if(config.year_zero) {
            // Switch to full year
            data[0][1] = "20" + data[0][1];
            data[0][2] = 4;
        }

        let images = [];
        for(let i in data) {
            let [prefix, value, fullLength] = data[i];

            if(!config[prefix + lang + "_array"]) continue;
            const imgs = config[prefix + lang + "_array"];

            let basementImg;
            try {
                basementImg = await runtime.getAssetImage(imgs[0]);
            } catch(e) {
                continue;
            }

            let img = null;
            if(config[prefix + "is_character"]) {
                try {
                    img = await runtime.getAssetImage(imgs[value - 1]);
                } catch (e) {
                    continue;
                }
            } else {
                value = value.toString();
                if(config[prefix + "zero"]) {
                    value = value.padStart(fullLength, "0");
                }

                try {
                    img = await TextImageWidget.draw(runtime, value, 0, {
                        font_array: config[prefix + lang + "_array"],
                        h_space: config[prefix + "space"],
                        unit_sc: config[prefix + "unit_sc"],
                        unit_tc: config[prefix + "unit_tc"],
                        unit_en: config[prefix + "unit_en"],
                        align: config[prefix + "align"]
                    });
                } catch(e) {
                    console.warn(e);
                    continue;
                }
            }

            if(!img) continue;
            if(config[prefix + "follow"] > 0 && images.length > 0) {
                let [lastImg, lastPrefix, expectedWidth] = images.pop();

                let offset = config[lastPrefix + "space"];
                if(!offset) offset = 0;
                const combinedImg = runtime.newCanvas();
                combinedImg.width = lastImg.width + img.width + offset;
                combinedImg.height = Math.max(lastImg.height, img.height);
                const cctx = combinedImg.getContext("2d");
                cctx.drawImage(lastImg, 0, 0);
                cctx.drawImage(img, lastImg.width + offset, 0);
                
                expectedWidth += fullLength * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await runtime.getAssetImage(config[prefix + "unit_en"]);
                    expectedWidth += unit.width;
                }
                
                images.push([combinedImg, lastPrefix, expectedWidth]);
            } else {
                let offset = config[prefix + "space"];
                if(!offset) offset = 0;
                let expectedWidth = fullLength * (basementImg.width + offset);
                if(config[prefix + "unit_en"]) {
                    let unit = await runtime.getAssetImage(config[prefix + "unit_en"]);
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
            this.dropEvents(runtime, [
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
    async render(canvas, runtime) {
        const config = this.config;

        let val = runtime.getDeviceState("WEEKDAY");
        if(!val || val < 0) val = 0;
        
        let font = config["week_" + runtime.language];
        if(!font || val >= font.length) return;

        try {
            const img = await runtime.getAssetImage(font[val]);
            canvas.getContext('2d').drawImage(img, config.x, config.y);
            this.dropEvents(runtime, [
                config.x,
                config.y,
                config.x + img.width,
                config.y + img.height
            ]);
        } catch(e) {
            // Ignore
        }
    }
}
