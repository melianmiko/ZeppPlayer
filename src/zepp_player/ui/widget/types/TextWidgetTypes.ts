import {BaseWidgetConfig} from "./BaseWidgetTypes";

export enum TextAlignOption {
    TOP = "top",
    BOTTOM = "bottom",
    CENTER_V = "center_v",
    LEFT = "left",
    CENTER_H = "center_h",
    RIGHT = "right",
}

export enum TextStyleOption {
    NONE,
    WRAP,
    CHAR_WRAP,
    ELLIPSIS,
}

export type TextWidgetConfig = BaseWidgetConfig & {
    text_size?: number,
    color?: number,
    char_space?: number,
    line_space?: number,
    align_v?: TextAlignOption,
    align_h?: TextAlignOption,
    text_style?: TextStyleOption,

    _metricsOnly?: boolean,
};
