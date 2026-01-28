import MapComponent from "./MapComponent";
import useCurvesProvider from "./DataLoader";
import Map from "ol/Map";

export default function MapController({map, backendUrl}: {map: Map, backendUrl: string}) {

    const {curves, changeLineOfSight} = useCurvesProvider(backendUrl);
    
    return (
        <>
            <MapComponent map={map}features={curves} onChangeLineOfSight={changeLineOfSight} />
        </>
    )
}