import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { selectClientById, useClientStore } from "../../stores/clientsStore";
import {
  countDefinedAttributes,
  createPaginationCursor,
  objectsToString,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterClients } from "./FilterClients";
import {
  ClientFilter,
  PaginationCursor,
  SortConfig,
} from "../../utils/data-filter-schema";
import { Client } from "../../utils/data-schema";
import { SortData } from "../SortData";

export interface SearchClientProps {
  onSearch: (searchIndex: string) => void;
  defaultFilter?: ClientFilter;
  defaultSortConfig?: SortConfig<Client>;
  recordsPerPage?: number;
  paginationId?: Client["id"] | undefined;
}
const defaults = {
  filter: { deletedEq: false } as ClientFilter,
  sortConfig: [{ column: "id", direction: "asc" }] as SortConfig<Client>,
  recordsPerPage: 5,
};

export default function SearchClients({
  onSearch,
  defaultFilter = defaults.filter,
  defaultSortConfig = defaults.sortConfig,
  recordsPerPage = defaults.recordsPerPage,
  paginationId,
}: SearchClientProps) {
  const { t } = useTranslation();
  const searchClients = useClientStore((store) => store.searchClients);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchingClients, setSearchingClients] = useState(false);
  const [searchClientsResponse, setSearchClientsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const paginationClient = useClientStore(selectClientById(paginationId));
  const paginationCursor: PaginationCursor<Client> | undefined = useMemo(
    () =>
      paginationClient
        ? createPaginationCursor(paginationClient, sortConfig)
        : undefined,
    [paginationClient, sortConfig]
  );

  console.log(`SearchClients -> render -
    defaultFilter: ${JSON.stringify(defaultFilter)}
    defaultSortConfig: ${JSON.stringify(defaultSortConfig)}
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}
    searchingClients: ${searchingClients}`);

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchClients effect
  useEffect(() => {
    const searchIndex = objectsToString(searchFilter, sortConfig);
    console.log(
      `SearchClients -> searchClients [effect] - 
        searchIndex: ${searchIndex}
        recordsPerPage: ${recordsPerPage}
        paginationCursor: ${objectsToString(paginationCursor)}`
    );

    setSearchClientsResponse(undefined);
    setSearchingClients(true);
    searchClients(searchFilter, sortConfig, recordsPerPage, paginationCursor)
      .then((response) => {
        setSearchClientsResponse(response);
        return !response.error ? onSearch(searchIndex) : undefined;
      })
      .finally(() => setSearchingClients(false));
  }, [
    searchFilter,
    sortConfig,
    recordsPerPage,
    paginationCursor,
    onSearch,
    searchClients,
  ]);

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
                : `${t("fields.searchLabel.text")} (${countDefinedAttributes(
                    searchFilter
                  )})`
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
          <Stack spacing={1}>
            <FilterClients filter={searchFilter} onChange={setSearchFilter} />
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
