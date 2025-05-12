import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  searchResultByStringFilter,
  usePropertyStore,
} from "../../stores/propertiesStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterProperties } from "./FilterProperties";
import { PropertyFilter } from "../../utils/data-filter-schema";
import { ListProperties } from "./ListProperties";
import CustomModal from "../CustomModal";
import { Property } from "../../utils/data-schema";
import CreateProperty from "./CreateProperty";

export interface SearchPropertiesProps {
  onSelect?: (selected: Array<Property["id"]>) => void;
  defaultSelected?: Array<Property["id"]>;
  multiselect?: boolean;
}

export default function SearchProperties({
  onSelect,
  defaultSelected = [],
  multiselect,
}: SearchPropertiesProps) {
  const searchProperties = usePropertyStore((store) => store.searchProperties);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [propertiesFilter, setPropertiesFilter] = useState({
    deleted: false,
  } as PropertyFilter);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [selectedProperties, setSelectedProperties] = useState(defaultSelected);
  const [createPropertyModalOpen, setCreatePropertyModalOpen] = useState(false);

  const filteredPropertyIds = usePropertyStore(
    searchResultByStringFilter(JSON.stringify(propertiesFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchProperties effect
  useEffect(() => {
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
      {searchPropertiesResponse?.error && (
        <Typography variant="h6" align="center" color="error">
          {searchPropertiesResponse.error.message}
        </Typography>
      )}
      {!searchPropertiesResponse?.error && (
        <ListProperties
          propertyIds={filteredPropertyIds ?? []}
          selected={selectedProperties}
          onSelect={onSelect ? setSelectedProperties : undefined}
          multiselect={multiselect}
          flexGrow={1}
        />
      )}

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              icon={
                searchingProperties ? (
                  <CircularProgress size="1em" />
                ) : undefined
              }
              label={
                searchingProperties
                  ? undefined
                  : `Filters (${countDefinedAttributes(propertiesFilter)})`
              }
              disabled={searchingProperties}
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
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={1}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreatePropertyModalOpen(true)}
          >
            New Property
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
        title="Create Property"
        open={createPropertyModalOpen}
        onClose={() => setCreatePropertyModalOpen(false)}
      >
        <CreateProperty onCreate={() => setCreatePropertyModalOpen(false)} />
      </CustomModal>
    </Stack>
  );
}
