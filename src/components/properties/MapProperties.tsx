import { useEffect, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

import { Property } from "../../utils/data-schema";
import { MemoMap } from "../Map";
import { osmMapTilesService } from "../../services/nominatimOSMApi";
import { usePropertyStore } from "../../stores/propertiesStore";
import { getIconForProperty } from "../../utils/mapMarkerIcons";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewProperty from "./ViewProperty";

export type MapProperties = BoxProps & {
  propertyIds: Array<Property["id"]>;
};

export default function MapProperties({
  propertyIds,
  ...boxProps
}: MapProperties) {
  const cachedProperties = usePropertyStore((store) => store.properties);
  const fetchProperties = usePropertyStore((store) => store.fetchProperties);

  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [fetchPropertiesResponse, setFetchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPropertyModalId, setViewPropertyModalId] = useState(
    undefined as Property["id"] | undefined
  );

  //fetchProperties effect
  useEffect(() => {
    setFetchPropertiesResponse(undefined);
    setFetchingProperties(true);
    fetchProperties(propertyIds)
      .then(setFetchPropertiesResponse)
      .finally(() => setFetchingProperties(false));
  }, [propertyIds, fetchProperties]);

  return (
    <Box
      {...boxProps}
      sx={(theme) => ({
        backgroundColor: theme.palette.grey[500],
        position: "relative",
      })}
    >
      <MemoMap mapTilesService={osmMapTilesService}>
        {propertyIds.map((propertyId, index) => {
          if (cachedProperties[propertyId]) {
            return (
              <Marker
                key={`property-marker-${index}`}
                position={cachedProperties[propertyId].coordinates}
                icon={getIconForProperty(cachedProperties[propertyId])}
              >
                <Popup>
                  <Typography>
                    {cachedProperties[propertyId].address}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => setViewPropertyModalId(propertyId)}
                    fullWidth
                  >
                    View
                  </Button>
                </Popup>
              </Marker>
            );
          }
        })}
      </MemoMap>
      {(fetchingProperties || fetchPropertiesResponse?.error) && (
        <Box
          position="absolute"
          left={0}
          top={0}
          boxSizing="border-box"
          width="100%"
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          zIndex={999}
          sx={{ backgroundColor: `rgba(0, 0, 0, .7)` }}
          borderRadius={2}
        >
          {fetchingProperties ? (
            <CircularProgress size="10em" />
          ) : (
            <Typography color="error" variant="h6">
              {fetchPropertiesResponse?.error?.message}
            </Typography>
          )}
        </Box>
      )}
      <CustomModal
        title={`View property: ${viewPropertyModalId ?? ""}`}
        open={viewPropertyModalId != undefined}
        onClose={() => setViewPropertyModalId(undefined)}
      >
        <ViewProperty propertyId={viewPropertyModalId!} />
      </CustomModal>
    </Box>
  );
}
