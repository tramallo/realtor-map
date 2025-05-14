import { useState, useCallback, useEffect } from "react";
import {
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
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
import { Property } from "../../utils/data-schema";

export interface SearchPropertiesProps {
  onSearch: (result: Array<Property["id"]>) => void;
  defaultFilter?: PropertyFilter;
}

export default function SearchProperties({
  onSearch,
  defaultFilter = { deleted: false },
}: SearchPropertiesProps) {
  const searchProperties = usePropertyStore((store) => store.searchProperties);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [propertiesFilter, setPropertiesFilter] = useState(defaultFilter);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
  );

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

  // callbackSearchResults effect
  useEffect(() => {
    onSearch(filteredPropertyIds ?? []);
  }, [filteredPropertyIds, onSearch]);

  return (
    <Stack spacing={1}>
      <Stack spacing={filtersVisible ? 1 : 0}>
        <Divider>
          <Chip
            icon={
              searchingProperties ? <CircularProgress size="1em" /> : undefined
            }
            label={
              searchingProperties
                ? undefined
                : searchPropertiesResponse?.error
                ? searchPropertiesResponse?.error.message
                : `Filters (${countDefinedAttributes(propertiesFilter)})`
            }
            disabled={searchingProperties}
            color={
              searchingProperties
                ? "info"
                : searchPropertiesResponse?.error
                ? "error"
                : "success"
            }
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
    </Stack>
  );
}
