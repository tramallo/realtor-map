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
  selectPropertyById,
  usePropertyStore,
} from "../../stores/propertiesStore";
import {
  countDefinedAttributes,
  createPaginationCursor,
  createSearchIndex,
  OperationResponse,
  SearchIndex,
} from "../../utils/helperFunctions";
import { FilterProperties } from "./FilterProperties";
import {
  SortConfig,
  PropertyFilter,
  PaginationCursor,
} from "../../utils/data-filter-schema";
import { Property } from "../../utils/data-schema";
import { SortData } from "../SortData";

export interface SearchPropertiesProps {
  onSearch: (searchIndex: SearchIndex) => void;
  defaultFilter?: PropertyFilter;
  defaultSortConfig?: SortConfig<Property>;
  recordsPerPage?: number;
  paginationId?: Property["id"] | undefined;
}
const defaults = {
  filter: { deletedEq: false } as PropertyFilter,
  sortConfig: [{ column: "id", direction: "asc" }] as SortConfig<Property>,
  recordsPerPage: 5,
};

export default function SearchProperties({
  onSearch,
  defaultFilter = defaults.filter,
  defaultSortConfig = defaults.sortConfig,
  recordsPerPage = defaults.recordsPerPage,
  paginationId,
}: SearchPropertiesProps) {
  const { t } = useTranslation();
  const searchProperties = usePropertyStore((store) => store.searchProperties);
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse<SearchIndex> | undefined
  );

  const [searchFilter, setSearchFilter] = useState(defaultFilter);
  const [sortConfig, setSortConfig] = useState(defaultSortConfig);

  const paginationProperty = usePropertyStore(selectPropertyById(paginationId));
  const paginationCursor: PaginationCursor<Property> | undefined = useMemo(
    () =>
      paginationProperty
        ? createPaginationCursor(paginationProperty, sortConfig)
        : undefined,
    [paginationProperty, sortConfig]
  );

  console.log(`SearchProperties -> render -
    filtersVisible: ${filtersVisible}
    defaultFilter: ${JSON.stringify(defaultFilter)}
    defaultSortConfig: ${JSON.stringify(defaultSortConfig)}
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}
    searchingProperties: ${searchingProperties}`);

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // fetchPaginationProperty effect
  useEffect(() => {
    if (paginationProperty || !paginationId) {
      return;
    }

    console.log(
      `SearchProperties -> fetchPaginationProperty [effect] - propertyId: ${paginationId}`
    );
    fetchProperty(paginationId);
  }, [paginationId, paginationProperty, fetchProperty]);

  // search effect
  useEffect(() => {
    console.log(
      `SearchProperties -> search [effect] - 
        filter: ${JSON.stringify(searchFilter)}
        sortConfig: ${JSON.stringify(sortConfig)}
        recordsPerPage: ${recordsPerPage}
        paginationCursor: ${createSearchIndex(paginationCursor)}`
    );

    setSearchPropertiesResponse(undefined);
    setSearchingProperties(true);
    searchProperties(searchFilter, sortConfig, recordsPerPage, paginationCursor)
      .then((response) => {
        setSearchPropertiesResponse(response);
        return !response.error ? onSearch(response.data) : undefined;
      })
      .finally(() => setSearchingProperties(false));
  }, [
    searchFilter,
    sortConfig,
    recordsPerPage,
    paginationCursor,
    onSearch,
    searchProperties,
  ]);

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
                : `${t("fields.searchLabel.text")} (${countDefinedAttributes(
                    searchFilter
                  )})`
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
          <Stack spacing={1}>
            <FilterProperties
              filter={searchFilter}
              onChange={setSearchFilter}
            />
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
