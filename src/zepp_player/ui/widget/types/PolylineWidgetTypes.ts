export type PolylineConfig = {
    x: number,
    y: number,
    w: number,
    h: number,
    line_color?: number,
    line_width?: number,
}

export type PolylinePoint = {
    x: number,
    y: number
}

export type AddLineConfig = {
    data: PolylinePoint[],
    count: number
}