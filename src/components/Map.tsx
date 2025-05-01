import "leaflet/dist/leaflet.css";
import { ReactNode, useEffect, useState, memo } from "react";
import {
  LatLngBounds,
  LatLngBoundsExpression,
  LatLngExpression,
} from "leaflet";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
import { CircularProgress, Stack, Typography } from "@mui/material";

import { MapTilesService } from "../utils/mapServicesSchemas";
import { OperationResponse } from "../utils/helperFunctions";

export interface MapProps {
  mapTilesService: MapTilesService;
  children?: ReactNode;
  position?: LatLngExpression;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: LatLngBoundsExpression;
}

// default values for Salto city, Uruguay
const defaults = {
  position: { lat: -31.39, lng: -57.95 },
  zoom: 12,
  minZoom: 11,
  maxZoom: 16,
  maxBounds: new LatLngBounds([-31.46, -58.01], [-31.34, -57.85]),
};

export function Map({
  children,
  mapTilesService,
  position = defaults.position,
  zoom = defaults.zoom,
  minZoom = defaults.minZoom,
  maxZoom = defaults.maxZoom,
  maxBounds = defaults.maxBounds,
}: MapProps) {
  console.log(`Map -> render`);

  const [fetchingMapTilesUrl, setFetchingMapTilesUrl] = useState(false);
  const [fetchMapTilesUrlResponse, setFetchMapTilesUrlResponse] = useState(
    undefined as OperationResponse<string> | undefined
  );

  //fetchTilesUrl effect
  useEffect(() => {
    console.log(`Map -> effect [fetchTilesUrl]`);

    setFetchMapTilesUrlResponse(undefined);
    setFetchingMapTilesUrl(true);
    mapTilesService
      .getMapTilesUrl()
      .then(setFetchMapTilesUrlResponse)
      .finally(() => setFetchingMapTilesUrl(false));
  }, [mapTilesService]);

  return (
    <Stack
      width="100%"
      height="100%"
      boxSizing="border-box"
      alignItems="center"
      justifyContent="center"
      border="2px solid black"
      borderRadius={2}
      overflow="hidden"
    >
      {fetchingMapTilesUrl && <CircularProgress size="50%" />}
      {!fetchingMapTilesUrl && fetchMapTilesUrlResponse?.error && (
        <Typography variant="h6" color="error">
          {fetchMapTilesUrlResponse?.error.message}
        </Typography>
      )}
      {!fetchingMapTilesUrl && fetchMapTilesUrlResponse?.data && (
        <MapContainer
          center={position}
          zoom={zoom}
          minZoom={minZoom}
          maxZoom={maxZoom}
          maxBounds={maxBounds}
          maxBoundsViscosity={0.5}
          zoomControl={false}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          <TileLayer
            url={fetchMapTilesUrlResponse.data}
            detectRetina={true}
            bounds={maxBounds}
            crossOrigin={true}
            attribution={mapTilesService.attribution}
          />
          <AttributionControl position="topleft" />
          {children && children}
        </MapContainer>
      )}
    </Stack>
  );
}

export const MemoMap = memo(Map);
