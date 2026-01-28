import Feature from "ol/Feature";
import { useState, useEffect, useRef, useCallback } from "react";
import OldGeoJSON, { type GeoJSONGeometry } from "ol/format/GeoJSON";
import { toLonLat } from "ol/proj";
import { Geometry, LineString } from "ol/geom";

export class QuadraticCurve extends LineString implements Geometry {
    constructor(points: number[][]) {
        if (points.length !== 3) {
            throw new Error("QuadraticCurve must have 3 points");
        }
        super(points);
    }
}
export class BezierCurve extends LineString implements Geometry {
    constructor(points: number[][]) {
        if (points.length !== 4) {
            throw new Error("BezierCurve must have 4 points");
        }
        super(points);
    }
}

class GeoJSON extends OldGeoJSON {
    constructor() {
        super();
    }

    protected readFeatureFromObject(object: GeoJSONGeometry, options?: import("ol/format/Feature").ReadOptions): Feature {
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

const getGeoJSONData = async (min_lon: number, min_lat: number, max_lon: number, max_lat: number, backendUrl: string = "http://localhost:8000/curves") => {
    const params = new URLSearchParams({
        min_lon: min_lon.toString(),
        min_lat: min_lat.toString(),
        max_lon: max_lon.toString(),
        max_lat: max_lat.toString()
    });
    const response = await fetch(`${backendUrl}?${params}`);
    const data = await response.json();
    return data;
}

export default function useCurvesProvider(backendUrl: string = "http://localhost:8000/curves",initial_min_lon: number = 0, initial_min_lat: number = 0, initial_max_lon: number = 0, initial_max_lat: number = 0) {
    const [curves, setCurves] = useState<Feature[]>([]);
    const geojson = useRef(new GeoJSON());
    const timerLink = useRef<number | null>(null);

    useEffect(() => {
        getGeoJSONData(initial_min_lon, initial_min_lat, initial_max_lon, initial_max_lat, backendUrl).then(
            (json_data)=> setCurves(geojson.current.readFeatures(json_data) as Feature[])
        );
    }, [backendUrl]);

    const loadCurves = useCallback(
        async (min_lon: number, min_lat: number, max_lon: number, max_lat: number) => {
            const data = await getGeoJSONData(min_lon, min_lat, max_lon, max_lat, backendUrl);
            setCurves(geojson.current.readFeatures(data) as Feature[]);
        }, [geojson.current, backendUrl]);

    const changeLineOfSight = useCallback((new_min_lon: number, new_min_lat: number, new_max_lon: number, new_max_lat: number) => {
        if (timerLink.current !== null) {
            clearTimeout(timerLink.current as number);
        }
        timerLink.current = setTimeout(()=>{
            const [minLonLat, minLatLat] = toLonLat([new_min_lon, new_min_lat]);
            const [maxLonLat, maxLatLat] = toLonLat([new_max_lon, new_max_lat]);
            loadCurves(minLonLat, minLatLat, maxLonLat, maxLatLat);
        }, 1000);
    }, [loadCurves]);
    
    return {curves, changeLineOfSight};
}
