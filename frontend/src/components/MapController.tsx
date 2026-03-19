// Пример использования lib
import MapUpdater from "./MapComponent";
import useFeaturesProvider from "./DataLoader";
import {Map, VectorLayer, TileLayer, LinkInteraction} from "react-openlayers";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import { useEffect, useRef } from "react";
import { withCurveStyle } from "../lib/curve-style";

const customStyle = withCurveStyle();

export default function MapController({backendUrl}: {backendUrl: string}) {

    const {features, changeLineOfSight} = useFeaturesProvider(backendUrl);
    const vectorSourceRef = useRef<VectorSource | null>(null);

    if (vectorSourceRef.current == null) {
      vectorSourceRef.current = new VectorSource({ features: features });
    }
    
    useEffect(() => {
        if (vectorSourceRef.current) {
            vectorSourceRef.current.clear();
            vectorSourceRef.current.addFeatures(features);
        }
    }, [features]);

    return <Map>
            <TileLayer source={new OSM()} />
            <VectorLayer source={vectorSourceRef.current} style={customStyle} updateWhileAnimating={true} updateWhileInteracting={true} renderBuffer={500}/>
            <MapUpdater onChangeLineOfSight={changeLineOfSight} />
            <LinkInteraction />
          </Map>
}