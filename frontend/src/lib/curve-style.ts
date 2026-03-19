// Тут напишется кастомный style для работы не только с обычными элементами, но и с кривыми

import { Style } from "ol/style";
import type { StyleFunction } from "ol/style/Style";
import { createDefaultStyle } from "ol/style/Style";
import type { FeatureLike } from "ol/Feature";
import { QuadraticCurve, BezierCurve } from "./geometries";

export const curveStyle = new Style(
    {
        renderer: (pixelCoords, state) => {
            const ctx = state.context;
            const pixelRatio = state.pixelRatio;
            const coords = pixelCoords as number[][];

            ctx.beginPath();
            ctx.moveTo(coords[0][0], coords[0][1]);
            if (coords.length === 3) {
                ctx.quadraticCurveTo(
                    coords[1][0], coords[1][1],
                    coords[2][0], coords[2][1]
                );
                ctx.strokeStyle = "green";
                ctx.lineWidth = 2 * pixelRatio;
                ctx.stroke();
                return;
            }
            else if (coords.length === 4) {
                ctx.bezierCurveTo(
                    coords[1][0], coords[1][1],
                    coords[2][0], coords[2][1],
                    coords[3][0], coords[3][1]
                );
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2 * pixelRatio;
                ctx.stroke();
            }
        }
    }
);

// Даём возможноть переписать стиль для кривых, а также вставить другой стиль для остальных фигур
export function withCurveStyle(rewriteCurveStyle?: Style, baseStyleFn?: StyleFunction): StyleFunction {
    const currentCurveStyle = rewriteCurveStyle ? rewriteCurveStyle : curveStyle;
    const fallback = baseStyleFn ? baseStyleFn : createDefaultStyle;
    return (feature: FeatureLike, resolution: number) => {
        const geom = feature.getGeometry();
        if (geom instanceof QuadraticCurve || geom instanceof BezierCurve) {
            return currentCurveStyle;
        }
        return fallback(feature, resolution);
    }
}
