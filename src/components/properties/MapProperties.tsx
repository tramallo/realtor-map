import { useEffect, useMemo, useState } from "react";
import { Marker, Popup } from "react-leaflet";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Stack,
  Typography,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import { Property } from "../../utils/data-schema";
import { propertyCompliesFilter } from "../../utils/filter-evaluators";
import CreateProperty from "./CreateProperty";
import ViewProperty from "./ViewProperty";
import { MemoMap } from "../Map";
import { osmMapTilesService } from "../../services/nominatimOSMApi";
import { getIconForProperty } from "../../utils/mapMarkerIcons";
import { MemoFilterProperties } from "./FilterProperties";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { MemoMapComponent } from "../MapComponent";
import CustomModal from "../CustomModal";
import { usePropertyStore } from "../../stores/propertiesStore";
import { PropertyFilter } from "../../utils/data-filter-schema";

export default function MapProperties() {
  const searchProperties = usePropertyStore((store) => store.searchProperties);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [showFiltersPane, setShowFiltersPane] = useState(false);
  const [propertiesFilter, setPropertiesFilter] = useState({
    deleted: false,
  } as PropertyFilter);

  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);
  const [viewPropertyId, setViewPropertyId] = useState(
    undefined as Property["id"] | undefined
  );

  const propertiesCache = usePropertyStore((store) => store.properties);
  const filteredProperties = useMemo(
    () =>
      Object.values(propertiesCache).filter((property) =>
        propertyCompliesFilter(property, propertiesFilter)
      ),
    [propertiesFilter, propertiesCache]
  );

  //searchProperties effect
  useEffect(() => {
    console.log(`PropertiesMap -> effect [searchProperties]`);

    setSearchPropertiesResponse(undefined);
    setSearchingProperties(true);
    searchProperties(propertiesFilter)
      .then(setSearchPropertiesResponse)
      .finally(() => setSearchingProperties(false));
  }, [propertiesFilter, searchProperties]);

  return (
    <Box
      padding={1}
      boxSizing="border-box"
      width="100%"
      height="100%"
      position="relative"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <MemoMap mapTilesService={osmMapTilesService}>
        <MemoMapComponent position="topright" customMargin="4px">
          <Button
            variant="contained"
            onClick={() => setCreatePropertyModalOpen(true)}
          >
            New property
          </Button>
        </MemoMapComponent>
        <MemoMapComponent position="bottomleft">
          <Stack alignItems="center">
            <Button
              variant="contained"
              onClick={() => setShowFiltersPane(!showFiltersPane)}
              disabled={searchingProperties}
            >
              {searchingProperties ? (
                <CircularProgress size="1.4em" />
              ) : (
                `Filters (${countDefinedAttributes(propertiesFilter)})`
              )}
            </Button>
            <Collapse
              in={showFiltersPane}
              sx={(theme) => ({
                backgroundColor: theme.palette.grey[500],
              })}
            >
              <Box padding={1}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <MemoFilterProperties
                    filter={propertiesFilter}
                    onChange={setPropertiesFilter}
                  />
                </LocalizationProvider>
              </Box>
            </Collapse>
          </Stack>
        </MemoMapComponent>
        {filteredProperties.map((property, index) => (
          <Marker
            key={`Properties-Map-Marker-${index}`}
            position={property.coordinates}
            icon={getIconForProperty(property)}
          >
            <Popup>
              <Typography>{property.address}</Typography>
              <Button
                variant="contained"
                onClick={() => setViewPropertyId(property.id)}
                fullWidth
              >
                View
              </Button>
            </Popup>
          </Marker>
        ))}
      </MemoMap>
      {searchPropertiesResponse?.error && (
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
          <Typography variant="h6" color="error">
            {searchPropertiesResponse?.error.message}
          </Typography>
        </Stack>
      )}
      <CustomModal
        title="Create property"
        open={createPropertyModalOpen}
        onClose={() => setCreatePropertyModalOpen(false)}
      >
        <CreateProperty />
      </CustomModal>
      <CustomModal
        title={`View property: ${viewPropertyId}`}
        open={viewPropertyId != undefined}
        onClose={() => setViewPropertyId(undefined)}
      >
        <ViewProperty propertyId={viewPropertyId ?? 0} />
      </CustomModal>
    </Box>
  );
}
