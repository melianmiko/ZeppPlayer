import {Canvas, CanvasRenderingContext2D as NodeCanvasRenderingContext2D, Image} from "canvas";

export type CanvasEntry = Canvas;
export type CanvasContextEntry = NodeCanvasRenderingContext2D;
export type ImageEntry = Image | HTMLImageElement;
