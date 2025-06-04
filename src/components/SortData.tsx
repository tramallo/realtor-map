import { useCallback, useMemo } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  SORT_BY_ID_ASC,
  SortColumn,
  SortConfig,
  SortConfigEntry,
  SortDirection,
  sortDirections,
} from "../utils/data-filter-schema";
import { BaseData, Property } from "../utils/data-schema";
import { CustomSelectField, SelectFieldOption } from "./CustomSelectField";

export interface SortDataProps<T extends BaseData> {
  sortConfig: SortConfig<T>;
  onChange: (newSortConfig: SortConfig<T>) => void;
  sortColumnOptions: Array<string>;
}

export function SortData<T extends BaseData>({
  sortConfig,
  onChange,
  sortColumnOptions,
}: SortDataProps<T>) {
  const { t } = useTranslation();

  const firstSortConfigEntry: SortConfigEntry<T> | undefined = useMemo(() => {
    if (sortConfig.length == 1) {
      // default SORT_BY_ID_ASC is not shown to user
      return undefined;
    }

    return sortConfig[0];
  }, [sortConfig]);

  const selectFieldColumnOptions: Array<SelectFieldOption<SortColumn<T>>> =
    useMemo(
      () =>
        sortColumnOptions.map((sortColumn) => ({
          label: sortColumn,
          value: sortColumn,
        })),
      [sortColumnOptions]
    );

  const setSortConfigColumn = useCallback(
    (newSortColumn: SortColumn<Property>) => {
      if (!newSortColumn) {
        onChange(SORT_BY_ID_ASC);
        return;
      }

      const newSortConfigEntry = {
        column: newSortColumn,
        direction: firstSortConfigEntry?.direction ?? "asc",
      };
      onChange([newSortConfigEntry, ...SORT_BY_ID_ASC]);
    },
    [firstSortConfigEntry, onChange]
  );
  const setSortConfigDirection = useCallback(
    (newDirection: SortDirection) => {
      if (!firstSortConfigEntry) {
        return;
      }

      const newSortConfigEntry = {
        column: firstSortConfigEntry.column,
        direction: newDirection,
      };
      onChange([newSortConfigEntry, ...SORT_BY_ID_ASC]);
    },
    [firstSortConfigEntry, onChange]
  );

  return (
    <Stack direction="row" spacing={1}>
      <CustomSelectField
        label={t("fields.sortByField.label")}
        value={firstSortConfigEntry?.column}
        onChange={setSortConfigColumn}
        options={selectFieldColumnOptions}
        emptyOptionLabel="_"
      />
      <CustomSelectField
        value={firstSortConfigEntry?.direction}
        onChange={setSortConfigDirection}
        options={sortDirections.map((dir) => ({ label: dir, value: dir }))}
      />
    </Stack>
  );
}
