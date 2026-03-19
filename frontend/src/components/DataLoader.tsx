// Загрузка и обновление данных из бэкенда
import Feature from "ol/Feature";
import { useState, useEffect, useRef, useCallback } from "react";
import { toLonLat } from "ol/proj";
import { GeoJSON } from "../lib/index";


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

export default function useFeaturesProvider(backendUrl: string = "http://localhost:8000/curves",initial_min_lon: number = 0, initial_min_lat: number = 0, initial_max_lon: number = 0, initial_max_lat: number = 0) {
    const [features, setFeatures] = useState<Feature[]>([]);
    const geojson = useRef(new GeoJSON());
    const timerLink = useRef<number | null>(null);

    useEffect(() => {
        getGeoJSONData(initial_min_lon, initial_min_lat, initial_max_lon, initial_max_lat, backendUrl).then(
            (json_data)=> setFeatures(geojson.current.readFeatures(json_data) as Feature[])
        );
    }, [backendUrl]);

    const loadFeatures = useCallback(
        async (min_lon: number, min_lat: number, max_lon: number, max_lat: number) => {
            const data = await getGeoJSONData(min_lon, min_lat, max_lon, max_lat, backendUrl);
            setFeatures(geojson.current.readFeatures(data) as Feature[]);
        }, [geojson.current, backendUrl]);

    const changeLineOfSight = useCallback((new_min_lon: number, new_min_lat: number, new_max_lon: number, new_max_lat: number) => {
        if (timerLink.current !== null) {
            clearTimeout(timerLink.current as number);
        }
        timerLink.current = setTimeout(()=>{
            const [minLonLat, minLatLat] = toLonLat([new_min_lon, new_min_lat]);
            const [maxLonLat, maxLatLat] = toLonLat([new_max_lon, new_max_lat]);
            loadFeatures(minLonLat, minLatLat, maxLonLat, maxLatLat);
        }, 1000);
    }, [loadFeatures]);
    
    return {features, changeLineOfSight};
}
