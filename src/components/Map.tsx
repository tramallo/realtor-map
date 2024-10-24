import { ReactNode, useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
} from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import "./Map.css";
import { MapTilesService } from "../utils/mapServicesSchemas";

export interface MapProps {
  children: ReactNode;
  mapTilesService: MapTilesService;
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
  children,
  mapTilesService,
  position = defaults.position,
  zoom = defaults.zoom,
  minZoom = defaults.minZoom,
  maxZoom = defaults.maxZoom,
  maxBounds = defaults.maxBounds,
}: MapProps) {
  const [mapTilesUrl, setMapTilesUrl] = useState("");

  useEffect(() => {
    mapTilesService
      .getMapTilesUrl()
      .then((url) => setMapTilesUrl(url))
      .catch((error) => console.log(error));
  }, [mapTilesService]);

  return (
    <div className="map">
      <MapContainer
        center={position}
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={0.5}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url={mapTilesUrl}
          detectRetina={true}
          bounds={maxBounds}
          crossOrigin={true}
          attribution={mapTilesService.attribution}
        />
        {children}
      </MapContainer>
    </div>
  );
}
