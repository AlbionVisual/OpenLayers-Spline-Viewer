// При взаимодействии с картой этот компонент просит обновить данные
import "react-openlayers/dist/index.css";
import { useMap } from "react-openlayers";
import { useCallback, useEffect, useRef } from "react";

interface MapUpdaterProps {
    onChangeLineOfSight?: (new_min_lon: number, new_min_lat:number, new_max_lon:number, new_max_lat:number)=>void
}

export default function MapUpdater({ onChangeLineOfSight }: MapUpdaterProps) {

  const mapLoaded = useRef(false);

  const map = useMap();

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
