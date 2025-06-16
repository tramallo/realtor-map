import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  selectContractById,
  useContractStore,
} from "../../stores/contractsStore";
import {
  countDefinedAttributes,
  createPaginationCursor,
  createSearchIndex,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterContracts } from "./FilterContracts";
import {
  ContractFilter,
  PaginationCursor,
  SortConfig,
} from "../../utils/data-filter-schema";
import { Contract } from "../../utils/data-schema";
import { SortData } from "../SortData";

export interface SearchContractsProps {
  onSearch: (searchIndex: string) => void;
  defaultFilter?: ContractFilter;
  defaultSortConfig?: SortConfig<Contract>;
  recordsPerPage?: number;
  paginationId?: Contract["id"] | undefined;
}
const defaults = {
  filter: { deletedEq: false } as ContractFilter,
  sortConfig: [{ column: "id", direction: "asc" }] as SortConfig<Contract>,
  recordsPerPage: 5,
};

export default function SearchContracts({
  onSearch,
  defaultFilter = defaults.filter,
  defaultSortConfig = defaults.sortConfig,
  recordsPerPage = defaults.recordsPerPage,
  paginationId,
}: SearchContractsProps) {
  const { t } = useTranslation();
  const searchContracts = useContractStore((store) => store.searchContracts);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchingContracts, setSearchingContracts] = useState(false);
  const [searchContractsResponse, setSearchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const paginationContract = useContractStore(selectContractById(paginationId));
  const paginationCursor: PaginationCursor<Contract> | undefined = useMemo(
    () =>
      paginationContract
        ? createPaginationCursor(paginationContract, sortConfig)
        : undefined,
    [paginationContract, sortConfig]
  );

  console.log(`SearchContracts -> render -
    defaultFilter: ${JSON.stringify(defaultFilter)}
    defaultSortConfig: ${JSON.stringify(defaultSortConfig)}
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}
    searchingContracts: ${searchingContracts}`);

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchContracts effect
  useEffect(() => {
    const searchIndex = createSearchIndex(searchFilter, sortConfig);
    console.log(
      `SearchContracts -> searchContracts [effect] - 
        searchIndex: ${searchIndex}
        recordsPerPage: ${recordsPerPage}
        paginationCursor: ${createSearchIndex(paginationCursor)}`
    );

    setSearchContractsResponse(undefined);
    setSearchingContracts(true);
    searchContracts(searchFilter, sortConfig, recordsPerPage, paginationCursor)
      .then((response) => {
        setSearchContractsResponse(response);
        return !response.error ? onSearch(searchIndex) : undefined;
      })
      .finally(() => setSearchingContracts(false));
  }, [
    searchFilter,
    sortConfig,
    recordsPerPage,
    paginationCursor,
    onSearch,
    searchContracts,
  ]);

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
                : `${t("fields.searchLabel.text")} (${countDefinedAttributes(
                    searchFilter
                  )})`
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
          <Stack spacing={1}>
            <FilterContracts filter={searchFilter} onChange={setSearchFilter} />
            <SortData
              sortConfig={sortConfig}
              onChange={setSortConfig}
              sortColumnOptions={["id", "createdAt"]}
            />
          </Stack>
        </Collapse>
      </Stack>
    </Stack>
  );
}
