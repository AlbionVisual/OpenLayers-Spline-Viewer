import { OSM } from "ol/source";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import {
  Map,
  View,
  TileLayer,
  VectorLayer,
  LinkInteraction,
} from "react-openlayers";
import "react-openlayers/dist/index.css";
import { Style } from "ol/style";
import type { Coordinate } from "ol/coordinate";
import type { Feature } from "ol";
import { useMemo, useRef } from "react";

const customStyle = new Style({
  renderer: (coords, state) => {
    const ctx = state.context;
    const pixelRatio = state.pixelRatio;

    console.log("styling");
    ctx.beginPath();
    ctx.moveTo((coords[0] as Coordinate)[0], (coords[0] as Coordinate)[1]);

    ctx.bezierCurveTo(
      (coords[1] as Coordinate)[0],
      (coords[1] as Coordinate)[1],
      (coords[2] as Coordinate)[0],
      (coords[2] as Coordinate)[1],
      (coords[coords.length - 1] as Coordinate)[0],
      (coords[coords.length - 1] as Coordinate)[1]
    );

    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2 * pixelRatio;
    ctx.stroke();
  },
});

export default function MapComponent({ features }: { features: Feature[] }) {
  const vectorSourceRef = useRef<VectorSource | null>(null);
  if (vectorSourceRef.current == null) {
    vectorSourceRef.current = new VectorSource({ features: features });
  }

  console.log(features, "features");

  useMemo(() => {
    if (vectorSourceRef.current) {
      vectorSourceRef.current.clear();
      vectorSourceRef.current.addFeatures(features);
    }
  }, [features]);

  const osm = useRef<OSM | null>(null);
  if (osm.current == null) {
    osm.current = new OSM();
  }

  console.log("Features count:", features.length);
  if (vectorSourceRef.current) {
    console.log(
      "VectorSource features:",
      vectorSourceRef.current.getFeatures().length
    );
  }

  return (
    <>
      <Map controls={[]}>
        <TileLayer source={osm.current} />
        <View center={fromLonLat([27.550013, 53.903564])} zoom={10} />
        <VectorLayer source={vectorSourceRef.current} style={customStyle} />
        <LinkInteraction />
      </Map>
    </>
  );
}
