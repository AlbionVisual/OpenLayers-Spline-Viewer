// Этот файл читает данные из json формата и возвращает набор Features. Тут переопределяется поведение GeoJSON для работые ещё и с кривыми
// Тут очень хорошо замаскировано наследование. На самом деле мы не переписываем код библиотеки, а просто добавляем свой функционал сверху.
import OldGeoJSON, { type GeoJSONGeometry } from "ol/format/GeoJSON";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { QuadraticCurve, BezierCurve } from "./geometries";

export class GeoJSON extends OldGeoJSON {
    constructor() {
        super({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        });
    }

    protected readFeatureFromObject(object: GeoJSONGeometry, options?: import("ol/format/Feature").ReadOptions): Feature {
        if (object.geometry.type === "Curve") {
            let geometry: Geometry;
            try {
                geometry = new QuadraticCurve(object.geometry.coordinates);
            }
            catch (error) {
                geometry = new BezierCurve(object.geometry.coordinates);
            }
            geometry.transform("EPSG:4326", "EPSG:3857");
            return new Feature({
                geometry: geometry as Geometry,
                properties: object.properties
            });
        }
        if (object.geometry.type === "QuadraticCurve") {
            const geometry = new QuadraticCurve(object.geometry.coordinates);
            geometry.transform("EPSG:4326", "EPSG:3857");
            return new Feature({
                geometry: geometry,
                properties: object.properties
            });
        } else if (object.geometry.type === "BezierCurve") {
            const geometry = new BezierCurve(object.geometry.coordinates);
            geometry.transform("EPSG:4326", "EPSG:3857");
            return new Feature({
                geometry: geometry,
                properties: object.properties
            });
        }

        return super.readFeatureFromObject(object, options) as Feature;
    }
}