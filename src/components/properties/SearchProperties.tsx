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
  objectsToString,
  OperationResponse,
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
  onSearch: (searchIndex: string) => void;
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

  const [filtersVisible, setFiltersVisible] = useState(false);

  const [searchingProperties, setSearchingProperties] = useState(false);
  const [searchPropertiesResponse, setSearchPropertiesResponse] = useState(
    undefined as OperationResponse | undefined
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
    defaultFilter: ${JSON.stringify(defaultFilter)}
    defaultSortConfig: ${JSON.stringify(defaultSortConfig)}
    recordsPerPage: ${recordsPerPage}
    paginationCursor: ${JSON.stringify(paginationCursor)}
    searchingProperties: ${searchingProperties}`);

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchProperties effect
  useEffect(() => {
    const searchIndex = objectsToString(searchFilter, sortConfig);
    console.log(
      `SearchProperties -> searchProperties [effect] - 
        searchIndex: ${searchIndex}
        recordsPerPage: ${recordsPerPage}
        paginationCursor: ${objectsToString(paginationCursor)}`
    );

    setSearchPropertiesResponse(undefined);
    setSearchingProperties(true);
    searchProperties(searchFilter, sortConfig, recordsPerPage, paginationCursor)
      .then((response) => {
        setSearchPropertiesResponse(response);
        return !response.error ? onSearch(searchIndex) : undefined;
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
