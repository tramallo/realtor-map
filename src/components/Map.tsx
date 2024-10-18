import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from "react-leaflet";
import { LatLng, TileEvent } from "leaflet";

import "./Map.css";
import { useEffect, useRef, useState } from "react";

export interface MapProps {
  defaultPosition: LatLng;
  defaultZoom: number;
}

export default function Map({ defaultPosition, defaultZoom }: MapProps) {
  const infoRef = useRef<HTMLDivElement | null>(null);

  const [loadedTiles, setLoadedTiles] = useState([] as string[]);

  const handleTileLoad = (e: TileEvent) => {
    const tileUrl = e.tile.src;

    console.log(`load: ${tileUrl}`);
    setLoadedTiles((prevLoadedTiles) => [...prevLoadedTiles, tileUrl]);
  };

  useEffect(() => {
    if (!infoRef.current) {
      return;
    }

    const infoDiv = infoRef.current!;
    infoDiv.innerText = `loaded tiles count: ${loadedTiles.length}`;
  }, [infoRef, loadedTiles]);

  return (
    <div className="map">
      <div ref={infoRef}>info info info</div>
      <MapContainer
        center={defaultPosition}
        zoom={defaultZoom}
        attributionControl={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          detectRetina={true}
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
