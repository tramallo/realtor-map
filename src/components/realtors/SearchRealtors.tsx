import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { selectRealtorById, useRealtorStore } from "../../stores/realtorsStore";
import {
  countDefinedAttributes,
  createPaginationCursor,
  createSearchIndex,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterRealtors } from "./FilterRealtors";
import {
  PaginationCursor,
  RealtorFilter,
  SortConfig,
} from "../../utils/data-filter-schema";
import { Realtor } from "../../utils/data-schema";
import { SortData } from "../SortData";

export interface SearchRealtorsProps {
  onSearch: (searchIndex: string) => void;
  defaultFilter?: RealtorFilter;
  defaultSortConfig?: SortConfig<Realtor>;
  recordsPerPage?: number;
  paginationId?: Realtor["id"] | undefined;
}
const defaults = {
  filter: { deletedEq: false } as RealtorFilter,
  sortConfig: [{ column: "id", direction: "asc" }] as SortConfig<Realtor>,
  recordsPerPage: 5,
};

export default function SearchRealtors({
  onSearch,
  defaultFilter = defaults.filter,
  defaultSortConfig = defaults.sortConfig,
  recordsPerPage = defaults.recordsPerPage,
  paginationId,
}: SearchRealtorsProps) {
  const { t } = useTranslation();
  const searchRealtors = useRealtorStore((store) => store.searchRealtors);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchingRealtors, setSearchingRealtors] = useState(false);
  const [searchRealtorsResponse, setSearchRealtorsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const paginationRealtor = useRealtorStore(selectRealtorById(paginationId));
  const paginationCursor: PaginationCursor<Realtor> | undefined = useMemo(
    () =>
      paginationRealtor
        ? createPaginationCursor(paginationRealtor, sortConfig)
        : undefined,
    [paginationRealtor, sortConfig]
  );

  console.log(`SearchRealtors -> render -
    defaultFilter: ${JSON.stringify(defaultFilter)}
    defaultSortConfig: ${JSON.stringify(defaultSortConfig)}
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}
    searchingRealtors: ${searchingRealtors}`);

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchRealtors effect
  useEffect(() => {
    const searchIndex = createSearchIndex(searchFilter, sortConfig);
    console.log(
      `SearchProperties -> searchProperties [effect] - 
        searchIndex: ${searchIndex}
        recordsPerPage: ${recordsPerPage}
        paginationCursor: ${createSearchIndex(paginationCursor)}`
    );

    setSearchRealtorsResponse(undefined);
    setSearchingRealtors(true);
    searchRealtors(searchFilter, sortConfig, recordsPerPage, paginationCursor)
      .then((response) => {
        setSearchRealtorsResponse(response);
        return !response.error ? onSearch(searchIndex) : undefined;
      })
      .finally(() => setSearchingRealtors(false));
  }, [
    searchFilter,
    sortConfig,
    recordsPerPage,
    paginationCursor,
    onSearch,
    searchRealtors,
  ]);

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
                : `${t("fields.searchLabel.text")} (${countDefinedAttributes(
                    searchFilter
                  )})`
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
          <Stack spacing={1}>
            <FilterRealtors filter={searchFilter} onChange={setSearchFilter} />
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
