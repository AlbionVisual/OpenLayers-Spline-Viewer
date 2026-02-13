import "./index.css";
import "react-openlayers/dist/index.css";
import "ol/ol.css";

import { createRoot } from "react-dom/client";
import MapController from "./components/MapController";
import LinkInteraction from "ol/interaction/Link";

let root: any = null;
let instances: any[] = [];

// render all instances of incoming MapControllers
function renderAll() {
  if (!root) {
    let div = document.createElement("div");
    document.body.appendChild(div);
    root = createRoot(div);
  }
  root.render(
    instances.map(function (x) {
      return (
        <MapController
          key={x.map.get("id") || Math.random().toString(36).substring(2, 15)}
          map={x.map}
          backendUrl={x.backendUrl}
        />
      );
    })
  );
}

export function createCurvesLayer(map: any, backendUrl: any) {
  let inst = { map: map, backendUrl: backendUrl };
  instances.push(inst);
  renderAll();
  return {
    destroy: function () {
      instances = instances.filter(function (i) {
        return i !== inst;
      });
      renderAll();
    },
  };
}

// Пример исопльзования

import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
// import { createCurvesLayer } from "./main"

let mapElement = document.createElement("div");
mapElement.id = "map";
mapElement.style.width = "100vw";
mapElement.style.height = "100vh";
document.body.appendChild(mapElement);

let map = new Map({
  target: mapElement,
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([27.550013, 53.903564]),
    zoom: 10,
  }),
});
map.addInteraction(new LinkInteraction());

const apiUrl = import.meta.env.REACT_APP_API_URL || "http://localhost:8000";

let exampleLayer = createCurvesLayer(map, `${apiUrl}/curves`);
exampleLayer;
