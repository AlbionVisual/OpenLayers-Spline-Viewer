import MapComponent from "./MapComponent";
import useCurvesProvider from "./DataLoader";
import { Map } from "react-openlayers";

export default function MapController() {

    const {curves, changeLineOfSight} = useCurvesProvider();
    
    return (
        <>
            <Map controls={[]}>
                <MapComponent features={curves} onChangeLineOfSight={changeLineOfSight} />
            </Map>
        </>
    )
}