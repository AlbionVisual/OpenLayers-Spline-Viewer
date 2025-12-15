import { OSM } from "ol/source";
import { Map, View, TileLayer, PointerInteraction } from "react-openlayers";
import "react-openlayers/dist/index.css"; // for css

export default function MapComponent() {
  return (
    <>
      <Map controls={[]} interactions={[]}>
        <TileLayer source={new OSM()} />
        <View center={[-10997148, 4569099]} zoom={10} />
        {/* <PointerInteraction /> */}
      </Map>
    </>
  );
}
