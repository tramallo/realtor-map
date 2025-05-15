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
  usePersonStore,
} from "../../stores/personsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterPersons } from "./FilterPersons";
import { PersonFilter } from "../../utils/data-filter-schema";
import { Person } from "../../utils/data-schema";

export interface SearchPersonsProps {
  onSearch: (result: Array<Person["id"]>) => void;
  defaultFilter?: PersonFilter;
}

export default function SearchPersons({
  onSearch,
  defaultFilter = { deleted: false },
}: SearchPersonsProps) {
  const searchPersons = usePersonStore((store) => store.searchPersons);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [personsFilter, setPersonsFilter] = useState(defaultFilter);

  const [searchingPersons, setSearchingPersons] = useState(false);
  const [searchPersonsResponse, setSearchPersonsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const filteredPersonIds = usePersonStore(
    searchResultByStringFilter(JSON.stringify(personsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchPersons effect
  useEffect(() => {
    setSearchPersonsResponse(undefined);
    setSearchingPersons(true);
    searchPersons(personsFilter)
      .then(setSearchPersonsResponse)
      .finally(() => setSearchingPersons(false));
  }, [searchPersons, personsFilter]);

  // callbackSearchResults effect
  useEffect(() => {
    onSearch(filteredPersonIds ?? []);
  }, [filteredPersonIds, onSearch]);

  return (
    <Stack spacing={1}>
      <Stack spacing={filtersVisible ? 1 : 0}>
        <Divider>
          <Chip
            icon={
              searchingPersons ? <CircularProgress size="1em" /> : undefined
            }
            label={
              searchingPersons
                ? undefined
                : searchPersonsResponse?.error
                ? searchPersonsResponse?.error.message
                : `Filters (${countDefinedAttributes(personsFilter)})`
            }
            disabled={searchingPersons}
            color={
              searchingPersons
                ? "info"
                : searchPersonsResponse?.error
                ? "error"
                : "success"
            }
            onClick={toggleFiltersVisibility}
            size="small"
          />
        </Divider>
        <Collapse in={filtersVisible}>
          <FilterPersons filter={personsFilter} onChange={setPersonsFilter} />
        </Collapse>
      </Stack>
    </Stack>
  );
}
