import { OSM } from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import "react-openlayers/dist/index.css";
import { Style } from "ol/style";
import Map from "ol/Map";
import type { Feature } from "ol";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Geometry } from "ol/geom";
import LineString from "ol/geom/LineString";

interface MapComponentProps {
    features: Feature[],
    onChangeLineOfSight?: (new_min_lon: number, new_min_lat:number, new_max_lon:number, new_max_lat:number)=>void
    map: Map
}

export default function MapComponent({ features, onChangeLineOfSight, map }: MapComponentProps) {
  const vectorLayerRef = useRef<VectorLayer | null>(null);
  const vectorSourceRef = useRef<VectorSource | null>(null);
  const osm = useRef<OSM | null>(null);
  const mapLoaded = useRef(false);

  const customStyle = useMemo(() => new Style(
    {
    renderer: (pixelCoords, state) => {
      const ctx = state.context;
      const pixelRatio = state.pixelRatio;
      const feature = state.feature as Feature;
      const geometry = feature.getGeometry() as Geometry;
      // console.log(state, map)
      let curveCoords: number[][] = (geometry as LineString).getCoordinates();
      
      const p0 = pixelCoords[0] as number[];
      const m0 = curveCoords[0];
      
      const resolution = state.resolution;
      const toPixel = (c: number[]) => [
        p0[0] + (c[0] - m0[0]) / resolution,
        p0[1] - (c[1] - m0[1]) / resolution
      ];
      
      curveCoords = curveCoords.map(toPixel);

      ctx.beginPath();
      ctx.moveTo(curveCoords[0][0], curveCoords[0][1]);
      if (curveCoords.length === 3) {
        ctx.quadraticCurveTo(
          curveCoords[1][0],
          curveCoords[1][1],
          curveCoords[2][0],
          curveCoords[2][1]
        );
        ctx.strokeStyle = "green";
        ctx.lineWidth = 2 * pixelRatio;
        ctx.stroke();
        return;
      }
      else if (curveCoords.length === 4) {
        ctx.bezierCurveTo(
          curveCoords[1][0],
          curveCoords[1][1],
          curveCoords[2][0],
          curveCoords[2][1],
          curveCoords[3][0],
          curveCoords[3][1]
        );

        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2 * pixelRatio;
        ctx.stroke();
      }
    }
  }
), []);

  if (osm.current == null) {
    osm.current = new OSM();
  }
  if (vectorSourceRef.current == null) {
    vectorSourceRef.current = new VectorSource({ features: features });
  }
  if (vectorLayerRef.current == null) {
    vectorLayerRef.current = new VectorLayer({ source: vectorSourceRef.current, style: customStyle, updateWhileAnimating: true, updateWhileInteracting: true, renderBuffer: 500 });
    map.addLayer(vectorLayerRef.current);
  }

  useEffect(()=>{
    return () => {
      if (vectorLayerRef.current) {
        map.removeLayer(vectorLayerRef.current);
      }
    }
  }, [map]);

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

  return null;
}
