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
  useContractStore,
} from "../../stores/contractsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterContracts } from "./FilterContracts";
import { ContractFilter } from "../../utils/data-filter-schema";
import { Contract } from "../../utils/data-schema";

export interface SearchContractsProps {
  onSearch: (result: Array<Contract["id"]>) => void;
  defaultFilter?: ContractFilter;
}

export default function SearchContracts({
  onSearch,
  defaultFilter = { deleted: false },
}: SearchContractsProps) {
  const searchContracts = useContractStore((store) => store.searchContracts);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contractsFilter, setContractsFilter] = useState(defaultFilter);

  const [searchingContracts, setSearchingContracts] = useState(false);
  const [searchContractsResponse, setSearchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const filteredContractIds = useContractStore(
    searchResultByStringFilter(JSON.stringify(contractsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchContracts effect
  useEffect(() => {
    setSearchContractsResponse(undefined);
    setSearchingContracts(true);
    searchContracts(contractsFilter)
      .then(setSearchContractsResponse)
      .finally(() => setSearchingContracts(false));
  }, [searchContracts, contractsFilter]);

  // callbackSearchResults effect
  useEffect(() => {
    onSearch(filteredContractIds ?? []);
  }, [filteredContractIds, onSearch]);

  return (
    <Stack spacing={1}>
      <Stack spacing={filtersVisible ? 1 : 0}>
        <Divider>
          <Chip
            icon={
              searchingContracts ? <CircularProgress size="1em" /> : undefined
            }
            label={
              searchingContracts
                ? undefined
                : searchContractsResponse?.error
                ? searchContractsResponse?.error.message
                : `Filters (${countDefinedAttributes(contractsFilter)})`
            }
            disabled={searchingContracts}
            color={
              searchingContracts
                ? "info"
                : searchContractsResponse?.error
                ? "error"
                : "success"
            }
            onClick={toggleFiltersVisibility}
            size="small"
          />
        </Divider>
        <Collapse in={filtersVisible}>
          <FilterContracts
            filter={contractsFilter}
            onChange={setContractsFilter}
          />
        </Collapse>
      </Stack>
    </Stack>
  );
}
