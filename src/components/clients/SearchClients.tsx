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
  useClientStore,
} from "../../stores/clientsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterClients } from "./FilterClients";
import { ClientFilter } from "../../utils/data-filter-schema";
import { Client } from "../../utils/data-schema";

export interface SearchClientProps {
  onSearch: (result: Array<Client["id"]>) => void;
  defaultFilter?: ClientFilter;
}

export default function SearchClients({
  onSearch,
  defaultFilter = { deleted: false },
}: SearchClientProps) {
  const searchClients = useClientStore((store) => store.searchClients);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [clientsFilter, setClientsFilter] = useState(defaultFilter);

  const [searchingClients, setSearchingClients] = useState(false);
  const [searchClientsResponse, setSearchClientsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const filteredClientIds = useClientStore(
    searchResultByStringFilter(JSON.stringify(clientsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchClients effect
  useEffect(() => {
    setSearchClientsResponse(undefined);
    setSearchingClients(true);
    searchClients(clientsFilter)
      .then(setSearchClientsResponse)
      .finally(() => setSearchingClients(false));
  }, [searchClients, clientsFilter]);

  // callbackSearchResults effect
  useEffect(() => {
    onSearch(filteredClientIds ?? []);
  }, [filteredClientIds, onSearch]);

  return (
    <Stack spacing={1}>
      <Stack spacing={filtersVisible ? 1 : 0}>
        <Divider>
          <Chip
            icon={
              searchingClients ? <CircularProgress size="1em" /> : undefined
            }
            label={
              searchingClients
                ? undefined
                : searchClientsResponse?.error
                ? searchClientsResponse?.error.message
                : `Filters (${countDefinedAttributes(clientsFilter)})`
            }
            disabled={searchingClients}
            color={
              searchingClients
                ? "info"
                : searchClientsResponse?.error
                ? "error"
                : "success"
            }
            onClick={toggleFiltersVisibility}
            size="small"
          />
        </Divider>
        <Collapse in={filtersVisible}>
          <FilterClients filter={clientsFilter} onChange={setClientsFilter} />
        </Collapse>
      </Stack>
    </Stack>
  );
}
