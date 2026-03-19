// Объекты наследуются от простой линии и переопределяют два свойства: getType() и constructor(). Далее будут использоваться в style renderer для отрисовки их не как линий, а как кривых.
import { LineString } from "ol/geom";

export class QuadraticCurve extends LineString {
    constructor(points: number[][]) {
        if (points.length !== 3) {
            throw new Error("QuadraticCurve must have 3 points");
        }
        super(points);
    }
}

export class BezierCurve extends LineString {
    constructor(points: number[][]) {
        if (points.length !== 4) {
            throw new Error("BezierCurve must have 4 points");
        }
        super(points);
    }
}