import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";

import FilterBaseData from "../FilterBaseData";
import { DebouncedTextField } from "../DebouncedTextField";
import { RealtorFilter } from "../../utils/data-filter-schema";

export interface FilterRealtorsProps {
  filter: RealtorFilter;
  onChange: (newValue: RealtorFilter) => void;
}

export function FilterRealtors({ filter, onChange }: FilterRealtorsProps) {
  console.log(
    `FilterRealtors -> render - defaultFilter: ${JSON.stringify(filter)}`
  );

  const setFilterValue = useCallback(
    (value: Partial<RealtorFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={12}>
        <DebouncedTextField
          label="Name"
          variant="outlined"
          value={filter.name || ""}
          onChange={(value) => setFilterValue({ name: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={12}>
        <FilterBaseData
          filter={filter}
          onChange={(newValue) => setFilterValue(newValue)}
        />
      </Grid2>
    </Grid2>
  );
}

export const MemoFilterPersons = memo(FilterRealtors);
