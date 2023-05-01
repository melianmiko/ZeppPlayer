import ZeppRuntime from "../ZeppRuntime";

export type BaseWidgetConfig = {
    __runtime: ZeppRuntime,
    show_level: number,
    visible?: boolean,
    __widget?: string,
    __eventOffsetX?: number,
    __eventOffsetY?: number,
    _name?: string,
    src?: string,
    text?: string,
    type?: any,
    x?: number,
    y?: number,
    w?: number,
    h?: number,
}

export type BaseWidgetEventInfo = {
    x: number,
    y: number
}

export type BaseWidgetEventHandler = (e: BaseWidgetEventInfo) => any;
export type BaseWidgetEvents = {
    [eventName: string]: BaseWidgetEventHandler,
}
