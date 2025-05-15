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
  useRealtorStore,
} from "../../stores/realtorsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterRealtors } from "./FilterRealtors";
import { RealtorFilter } from "../../utils/data-filter-schema";
import { Realtor } from "../../utils/data-schema";

export interface SearchRealtorsProps {
  onSearch: (result: Array<Realtor["id"]>) => void;
  defaultFilter?: RealtorFilter;
}

export default function SearchRealtors({
  onSearch,
  defaultFilter = { deleted: false },
}: SearchRealtorsProps) {
  const searchRealtors = useRealtorStore((store) => store.searchRealtors);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [realtorsFilter, setRealtorsFilter] = useState(defaultFilter);

  const [searchingRealtors, setSearchingRealtors] = useState(false);
  const [searchRealtorsResponse, setSearchRealtorsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const filteredRealtorIds = useRealtorStore(
    searchResultByStringFilter(JSON.stringify(realtorsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchRealtors effect
  useEffect(() => {
    setSearchRealtorsResponse(undefined);
    setSearchingRealtors(true);
    searchRealtors(realtorsFilter)
      .then(setSearchRealtorsResponse)
      .finally(() => setSearchingRealtors(false));
  }, [searchRealtors, realtorsFilter]);

  // callbackSearchResults effect
  useEffect(() => {
    onSearch(filteredRealtorIds ?? []);
  }, [filteredRealtorIds, onSearch]);

  return (
    <Stack spacing={1}>
      <Stack spacing={filtersVisible ? 1 : 0}>
        <Divider>
          <Chip
            icon={
              searchingRealtors ? <CircularProgress size="1em" /> : undefined
            }
            label={
              searchingRealtors
                ? undefined
                : searchRealtorsResponse?.error
                ? searchRealtorsResponse?.error.message
                : `Filters (${countDefinedAttributes(realtorsFilter)})`
            }
            disabled={searchingRealtors}
            color={
              searchingRealtors
                ? "info"
                : searchRealtorsResponse?.error
                ? "error"
                : "success"
            }
            onClick={toggleFiltersVisibility}
            size="small"
          />
        </Divider>
        <Collapse in={filtersVisible}>
          <FilterRealtors
            filter={realtorsFilter}
            onChange={setRealtorsFilter}
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}
