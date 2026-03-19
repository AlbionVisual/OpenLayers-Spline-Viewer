import "./index.css";
import "react-openlayers/dist/index.css";
import "ol/ol.css";

import { createRoot } from "react-dom/client";
import MapController from "./components/MapController";

const apiUrl = import.meta.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  return (
    <MapController backendUrl={apiUrl + "/curves"} />
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);