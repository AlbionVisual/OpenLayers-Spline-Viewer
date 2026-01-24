import type { Feature } from "ol";
import { useState, useEffect, useRef, useCallback } from "react";
import GeoJSON from "ol/format/GeoJSON";
import { toLonLat } from "ol/proj";

const getGeoJSONData = async (min_lon: number, min_lat: number, max_lon: number, max_lat: number) => {
    const params = new URLSearchParams({
        min_lon: min_lon.toString(),
        min_lat: min_lat.toString(),
        max_lon: max_lon.toString(),
        max_lat: max_lat.toString()
    });
    const response = await fetch(`http://localhost:5000/curves?${params}`);
    const data = await response.json();
    return data;
}

export default function useCurvesProvider(initial_min_lon: number = 0, initial_min_lat: number = 0, initial_max_lon: number = 0, initial_max_lat: number = 0) {
    const [curves, setCurves] = useState<Feature[]>([]);
    const geojson = useRef(new GeoJSON());
    const timerLink = useRef<number | null>(null);

    useEffect(() => {
        getGeoJSONData(initial_min_lon, initial_min_lat, initial_max_lon, initial_max_lat).then(
            (json_data)=> setCurves(geojson.current.readFeatures(json_data, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857"
            }) as Feature[])
        );
    }, []);

    const loadCurves = useCallback(
        async (min_lon: number, min_lat: number, max_lon: number, max_lat: number) => {
            const data = await getGeoJSONData(min_lon, min_lat, max_lon, max_lat);
            setCurves(geojson.current.readFeatures(data, {
                dataProjection: "EPSG:4326",
                featureProjection: "EPSG:3857"
            }) as Feature[]);
        }, [geojson.current]);

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
