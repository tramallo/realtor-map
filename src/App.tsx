import { LatLng } from "leaflet";

import "./App.css";
import Map from "./components/Map";

export default function App() {
  const defaultPosition = new LatLng(-31.39, -57.95);
  const defaultZoom = 12;

  return (
    <div id="app">
      <Map defaultPosition={defaultPosition} defaultZoom={defaultZoom} />
    </div>
  );
}
