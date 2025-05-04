import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { MemoMap } from "./Map";
import { searchMarkerIcon } from "../utils/mapMarkerIcons";
import {
  Location,
  GeocodingService,
  MapTilesService,
} from "../utils/services-interface";
import { DebouncedTextField } from "./DebouncedTextField";
import { OperationResponse } from "../utils/helperFunctions";

export interface AddressSearchProps {
  geocodingService: GeocodingService;
  mapTilesService: MapTilesService;
  onLocationSelect?: (location: Location) => void;
}

export default function AddressSearch({
  mapTilesService,
  geocodingService,
  onLocationSelect,
}: AddressSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [searchAddressResponse, setSearchAddressResponse] = useState(
    undefined as OperationResponse<Location[]> | undefined
  );

  //searchAddress effect
  useEffect(() => {
    console.log(`AddressSearch -> effect [searchAddress]`);

    if (searchValue === "") {
      setSearchAddressResponse({ data: [] });
      return;
    }

    setSearchAddressResponse(undefined);
    setSearchingAddress(true);
    geocodingService
      .searchAddress(searchValue)
      .then(setSearchAddressResponse)
      .finally(() => setSearchingAddress(false));
  }, [searchValue, geocodingService]);

  return (
    <Stack spacing={1} padding={1}>
      <DebouncedTextField
        label="Search address"
        value={searchValue}
        onChange={setSearchValue}
      />
      <Box boxSizing="border-box" height="70svh" position="relative">
        <MemoMap mapTilesService={mapTilesService}>
          {!searchingAddress &&
            searchAddressResponse?.data &&
            searchAddressResponse.data.map((location, index) => (
              <Marker
                key={`AddressSearch-location-${index}`}
                position={location.coordinates}
                icon={searchMarkerIcon}
              >
                <Popup>
                  <Typography>{location.address}</Typography>
                  {onLocationSelect && (
                    <Button
                      variant="contained"
                      onClick={() => onLocationSelect(location)}
                      fullWidth
                    >
                      Select
                    </Button>
                  )}
                </Popup>
              </Marker>
            ))}
        </MemoMap>
        {(searchingAddress || searchAddressResponse?.error) && (
          <Stack
            position="absolute"
            boxSizing="border-box"
            padding={1}
            left={0}
            top={0}
            width="100%"
            height="100%"
            zIndex={1000}
            bgcolor="rgba(100, 100, 100, .8)"
            alignItems="center"
            justifyContent="center"
          >
            {searchAddressResponse?.error ? (
              <Typography variant="h6" color="error">
                {searchAddressResponse?.error.message}
              </Typography>
            ) : (
              <CircularProgress size="20svw" />
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
