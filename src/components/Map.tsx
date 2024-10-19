import "leaflet/dist/leaflet.css";
import {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
  TileEvent,
} from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import "./Map.css";
import { useEffect, useRef, useState } from "react";

export interface MapProps {
  position?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LatLngBoundsExpression;
}
const defaults = {
  position: { lat: -31.39, lng: -57.95 },
  zoom: 12,
  minZoom: 11,
  maxZoom: 16,
  maxBounds: new LatLngBounds([-31.46, -58.01], [-31.34, -57.85]),
};

export default function Map({
  position = defaults.position,
  zoom = defaults.zoom,
  minZoom = defaults.minZoom,
  maxZoom = defaults.maxZoom,
  maxBounds = defaults.maxBounds,
}: MapProps) {
  const infoRef = useRef<HTMLDivElement | null>(null);

  const [loadedTiles, setLoadedTiles] = useState([] as string[]);

  const handleTileLoad = (e: TileEvent) => {
    const tileUrl = e.tile.src;

    console.log(`load: ${tileUrl}`);
    setLoadedTiles((prevLoadedTiles) => [...prevLoadedTiles, tileUrl]);
  };

  // show loaded tiles count on info div
  useEffect(() => {
    if (!infoRef.current) {
      return;
    }

    const infoDiv = infoRef.current!;
    infoDiv.innerText = `Loaded tiles count: ${loadedTiles.length}`;
  }, [infoRef, loadedTiles]);

  return (
    <div className="map">
      <div ref={infoRef}>info info info</div>
      <MapContainer
        center={position}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={0.5}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          detectRetina={true}
          bounds={maxBounds}
          eventHandlers={{ tileload: handleTileLoad }}
        />
      </MapContainer>
      <label className="attribution">
        🇺🇦 <a href="https://leafletjs.com">Leaftlet</a> | &copy;{" "}
        <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>{" "}
        contributors
      </label>
    </div>
  );
}
