import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";

import FilterBaseData from "../FilterBaseData";
import { CustomTextField } from "../CustomTextField";
import { PersonFilter } from "../../utils/data-filter-schema";

export interface FilterPersonsProps {
  filter: PersonFilter;
  onChange: (newValue: PersonFilter) => void;
}

export function FilterPersons({ filter, onChange }: FilterPersonsProps) {
  console.log(
    `FilterPersons -> render - defaultFilter: ${JSON.stringify(filter)}`
  );

  const setFilterValue = useCallback(
    (value: Partial<PersonFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={6}>
        <CustomTextField
          label="Name"
          variant="outlined"
          value={filter.name || ""}
          delay={500}
          onChange={(value) => setFilterValue({ name: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label="Mobile"
          variant="outlined"
          value={filter.mobile || ""}
          onChange={(value) => setFilterValue({ mobile: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
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
