import { fromLonLat } from "ol/proj";
import MapComponent from "./MapComponent";
import type { Feature } from "ol";
import { useState, useEffect, useRef } from "react";
import GeoJSON from "ol/format/GeoJSON";

const testGeoJSONData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString", // или специальный тип для сплайна
        coordinates: [
          [27.550013, 53.903564], // начальная точка (Минск, центр)
          [27.552, 53.904], // контрольная точка 1
          [27.553, 53.902], // контрольная точка 2 (для bezierCurveTo)
          [27.555, 53.9045], // конечная точка
        ],
      },
      properties: {
        curveType: "bezier", // "quadratic" | "bezier"
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [27.550013, 53.903564],
          [27.5515, 53.904],
          [27.5525, 53.9025],
          [27.554, 53.9043],
        ],
      },
      properties: {
        curveType: "bezier",
      },
    },
  ],
};

export default function DataLoader() {
  const format = useRef<GeoJSON | null>(null);

  if (format.current == null) {
    format.current = new GeoJSON();
  }
  const [features, setFeatures] = useState<Feature[]>(
    format.current!.readFeatures(testGeoJSONData, {
      featureProjection: "EPSG:3857",
    })
  );

  //   useEffect(() => {
  //     if (format.current)
  //       setFeatures(format.current.readFeatures(testGeoJSONData));
  //   }, []);

  return (
    <>
      <MapComponent features={features} />
    </>
  );
}
