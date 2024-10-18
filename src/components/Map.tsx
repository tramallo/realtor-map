import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { LatLng, LeafletEventHandlerFnMap, TileEvent } from "leaflet";

import "./Map.css";
import MapEventHandler from "./MapEventHandler";

export default function Map() {
  const defaultPosition = new LatLng(-31.39, -57.95);
  const defaultZoom = 12;

  const eventHandlerMap: LeafletEventHandlerFnMap = {
    //tileload: (e: TileEvent) => console.log(e),
  };

  return (
    <div className="map">
      <div>info info info</div>
      <MapContainer
        center={defaultPosition}
        zoom={defaultZoom}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          detectRetina={true}
          eventHandlers={{ tileload: (e: TileEvent) => console.log(e) }}
        />

        <MapEventHandler eventMap={eventHandlerMap} />
      </MapContainer>
      <label className="attribution">
        🇺🇦 <a href="https://leafletjs.com">Leaftlet</a> | &copy;{" "}
        <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>{" "}
        contributors
      </label>
    </div>
  );
}
