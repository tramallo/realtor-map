import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";

import { PersonFilterData } from "../../utils/domainSchemas";
import FilterBaseData from "../FilterBaseData";
import { DebouncedTextField } from "../DebouncedTextField";

export interface FilterPersonsProps {
  filter: PersonFilterData;
  onChange: (newValue: PersonFilterData) => void;
}

export function FilterPersons({ filter, onChange }: FilterPersonsProps) {
  console.log(
    `FilterPersons -> render - defaultFilter: ${JSON.stringify(filter)}`
  );

  const setFilterValue = useCallback(
    (value: Partial<PersonFilterData>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={6}>
        <DebouncedTextField
          label="Name"
          variant="outlined"
          value={filter.name || ""}
          onChange={(value) => setFilterValue({ name: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DebouncedTextField
          label="Mobile"
          variant="outlined"
          value={filter.mobile || ""}
          onChange={(value) => setFilterValue({ mobile: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DebouncedTextField
          label="Email"
          variant="outlined"
          value={filter.email || ""}
          onChange={(value) => setFilterValue({ email: value || undefined })}
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

export const MemoFilterPersons = memo(FilterPersons);
