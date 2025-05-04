import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { usePropertyStore } from "../../stores/propertiesStore";
import { Property } from "../../utils/data-schema";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { propertyCompliesFilter } from "../../utils/filter-evaluators";
import ComponentsField from "../ComponentsField";
import { FilterProperties } from "./FilterProperties";
import CustomModal from "../CustomModal";
import CreateProperty from "./CreateProperty";
import ViewProperty from "./ViewProperty";
import { PropertyFilter } from "../../utils/data-filter-schema";

interface ListPropertiesProps {
  onSelect?: (propertyIds: Array<Property["id"]>) => void;
  defaultSelected?: Array<Property["id"]>;
  multiple?: boolean;
}

export default function ListProperties({
  onSelect,
  defaultSelected,
  multiple,
}: ListPropertiesProps) {
  const searchProperties = usePropertyStore((store) => store.searchProperties);

  const [selectedProperties, setSelectedProperties] = useState(
    defaultSelected ?? []
  );

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [propertiesFilter, setPropertiesFilter] = useState({
    deleted: false,
  } as PropertyFilter);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPropertyId, setViewPropertyId] = useState(
    undefined as Property["id"] | undefined
  );
  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);

  const cachedProperties = usePropertyStore((store) => store.properties);
  const filteredProperties = useMemo(
    () =>
      Object.values(cachedProperties).filter((property) =>
        propertyCompliesFilter(property, propertiesFilter)
      ),
    [cachedProperties, propertiesFilter]
  );

  const togglePropertySelection = useCallback(
    (propertyId: Property["id"]) => {
      const alreadySelected = selectedProperties.some(
        (selectedId) => selectedId === propertyId
      );

      //deselect
      if (alreadySelected) {
        setSelectedProperties((prevSelected) =>
          prevSelected.filter((id) => id !== propertyId)
        );
        return;
      }

      //select
      if (multiple) {
        setSelectedProperties((prevSelected) => [...prevSelected, propertyId]);
      } else {
        setSelectedProperties([propertyId]);
      }
    },
    [selectedProperties, multiple]
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  //searchProperties effect
  useEffect(() => {
    console.log(`ListProperties -> effect [searchProperties]`);

    setSearchPropertiesResponse(undefined);
    setSearchingProperties(true);
    searchProperties(propertiesFilter)
      .then(setSearchPropertiesResponse)
      .finally(() => setSearchingProperties(false));
  }, [searchProperties, propertiesFilter]);

  return (
    <Stack
      spacing={1}
      padding={1}
      height="100%"
      boxSizing="border-box"
      overflow="hidden"
      justifyContent="space-between"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <Box 
        overflow="auto" 
        border="2px solid black" 
        borderRadius={1}
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      >
        {searchPropertiesResponse?.error && (
          <Typography variant="h6" align="center" color="error">
            {searchPropertiesResponse.error.message}
          </Typography>
        )}
        {!searchPropertiesResponse?.error && (
          <>
            {!searchingProperties && filteredProperties.length === 0 ? (
              <Typography variant="h6" align="center" color="warning">
                No property(es) found
              </Typography>
            ) : (
              <List dense>
                {filteredProperties.map((property, index) => (
                  <ListItem
                    key={`list-property-${index}`}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        onClick={() => setViewPropertyId(property.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={
                        onSelect
                          ? () => togglePropertySelection(property.id)
                          : undefined
                      }
                    >
                      {onSelect && (
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedProperties.includes(property.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                      )}
                      <ListItemText primary={property.address} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {searchingProperties && (
              <Typography padding={1} align="center">
                <CircularProgress />
              </Typography>
            )}
          </>
        )}
      </Box>

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              label={`Filters (${countDefinedAttributes(propertiesFilter)})`}
              color="primary"
              onClick={toggleFiltersVisibility}
              size="small"
            />
          </Divider>
          <Collapse in={filtersVisible}>
            <FilterProperties
              filter={propertiesFilter}
              onChange={setPropertiesFilter}
            />
          </Collapse>
        </Stack>

        {onSelect && (
          <ComponentsField
            label="Selected"
            components={selectedProperties.map((selectedId) => (
              <Chip
                label={selectedId}
                onDelete={() => togglePropertySelection(selectedId)}
              />
            ))}
          />
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={2}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreatePropertyModalOpen(true)}
          >
            New property
          </Button>
          {onSelect && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => setSelectedProperties([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={() => onSelect(selectedProperties)}
              >
                Confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <CustomModal
        title="Create property"
        open={createPropertyModalOpen}
        onClose={() => setCreatePropertyModalOpen(false)}
      >
        <CreateProperty onCreate={() => setCreatePropertyModalOpen(false)} />
      </CustomModal>
      <CustomModal
        title={`View property: ${viewPropertyId}`}
        open={viewPropertyId != undefined}
        onClose={() => setViewPropertyId(undefined)}
      >
        <ViewProperty propertyId={viewPropertyId ?? 0} />
      </CustomModal>
    </Stack>
  );
}
