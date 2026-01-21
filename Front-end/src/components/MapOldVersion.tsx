import { useRef } from "react";
import "react-openlayers/dist/index.css";
import { Map, View, TileLayer, VectorLayer } from "react-openlayers";
import GeoJSON from "ol/format/GeoJSON";
import { Vector as VectorSource } from "ol/source";
import { OSM } from "ol/source";
import { Style, Stroke, Fill } from "ol/style";

const geojsonData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [27.567444, 53.902257],
      },
      properties: {
        name: "Минск",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [27.55, 53.9],
          [27.56, 53.91],
          [27.57, 53.92],
        ],
      },
      properties: {
        name: "Demo line",
      },
    },
  ],
};

export default function MapOldVersion() {
  const vectorSourceRef = useRef<any>(null);

  if (!vectorSourceRef.current) {
    vectorSourceRef.current = new VectorSource({
      features: new GeoJSON().readFeatures(geojsonData, {
        featureProjection: "EPSG:3857",
      }),
    });
  }

  const customStyle = new Style({
    stroke: new Stroke({
      color: "blue",
      width: 2,
    }),
    fill: new Fill({
      color: "rgba(0, 0, 255, 0.1)",
    }),
    image: undefined,
  });

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <Map>
        <TileLayer source={new OSM()} />
        <View center={[3068290, 7106651]} zoom={12} />
        <VectorLayer source={vectorSourceRef.current} style={customStyle} />
      </Map>
    </div>
  );
}
