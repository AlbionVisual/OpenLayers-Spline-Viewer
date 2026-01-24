import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import {
  View,
  TileLayer,
  VectorLayer,
  LinkInteraction,
  useMap,
} from "react-openlayers";
import "react-openlayers/dist/index.css";
import { Style } from "ol/style";
import type { Feature } from "ol";
import { useCallback, useEffect, useMemo, useRef } from "react";

interface MapComponentProps {
    features: Feature[],
    onChangeLineOfSight?: (new_min_lon: number, new_min_lat:number, new_max_lon:number, new_max_lat:number)=>void
}

export default function MapComponent({ features, onChangeLineOfSight }: MapComponentProps) {
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const osm = useRef<OSM | null>(null);
  const map = useMap();
  const mapLoaded = useRef(false);

  const customStyle = useMemo(() => new Style({
    renderer: (pixelCoords, state) => {
      const ctx = state.context;
      const pixelRatio = state.pixelRatio;
      const feature = state.feature as Feature;
      
      const curveCoords = feature.get('coords') as number[][];
      if (!curveCoords || curveCoords.length < 3) return;

      const mapCoords = curveCoords.map(c => fromLonLat(c));
      
      const p0 = pixelCoords as number[];
      const m0 = mapCoords[0];
      
      const resolution = state.resolution;
      const toPixel = (c: number[]) => [
        p0[0] + (c[0] - m0[0]) / resolution,
        p0[1] - (c[1] - m0[1]) / resolution
      ];
      
      const coords = mapCoords.map(toPixel);

      ctx.beginPath();
      ctx.moveTo(coords[0][0], coords[0][1]);

      const curveType = feature.get('curve_type');
      if (curveType === 'quadratic') {
        ctx.quadraticCurveTo(
          coords[1][0],
          coords[1][1],
          coords[2][0],
          coords[2][1]
        );
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2 * pixelRatio;
        ctx.stroke();
        return;
      }
      
      ctx.bezierCurveTo(
        coords[1][0],
        coords[1][1],
        coords[2][0],
        coords[2][1],
        coords[3][0],
        coords[3][1]
      );

      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2 * pixelRatio;
      ctx.stroke();
    },
  }), []);

  if (osm.current == null) {
    osm.current = new OSM();
  }
  if (vectorSourceRef.current == null) {
    vectorSourceRef.current = new VectorSource({ features: features });
  }

  useMemo(() => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      vectorSourceRef.current.addFeatures(features);
    }
  }, [features]);

  const handleMoveEnd = useCallback(()=>{
    const view = map?.getView();
    const extent = view?.calculateExtent(map?.getSize());
    if (extent) {
      onChangeLineOfSight?.(extent[0], extent[1], extent[2], extent[3]);
    }
  }, [map, onChangeLineOfSight]);

  useEffect(() => {
    if (!map) return;
    if (mapLoaded.current === false) {
        handleMoveEnd();
    }
    mapLoaded.current = true;
    
    map.on("moveend", handleMoveEnd);
    
    return () => {
      if (map) {
        map.un("moveend", handleMoveEnd);
      }
    }
  }, [map, handleMoveEnd]);

  return (
    <>
        <TileLayer source={osm.current} />
        <View center={fromLonLat([27.550013, 53.903564])} zoom={10}/>
        <VectorLayer source={vectorSourceRef.current} style={customStyle} updateWhileAnimating={true} updateWhileInteracting={true} renderBuffer={500}/>
        <LinkInteraction />
    </>
  );
}
