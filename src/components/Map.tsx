import "leaflet/dist/leaflet.css";
import {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
} from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "./Map.css";
import { useEffect, useState } from "react";
import { MapTilesService } from "../utils/mapServicesSchemas";

export interface MarkerData {
  text: string;
  position: LatLngExpression;
}

export interface MapProps {
  mapTilesService: MapTilesService;
  markers: MarkerData[];
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
  mapTilesService,
  markers,
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

        {markers.map((markerData, index) => (
          <Marker key={index} position={markerData.position}>
            <Popup>{markerData.text}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
