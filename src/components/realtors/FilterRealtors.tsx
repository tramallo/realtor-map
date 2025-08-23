import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";
import { useTranslation } from "react-i18next";

import FilterBaseData from "../FilterBaseData";
import { CustomTextField } from "../CustomTextField";
import { RealtorFilter } from "../../utils/data-filter-schema";

export interface FilterRealtorsProps {
  filter: RealtorFilter;
  onChange: (newValue: RealtorFilter) => void;
}

export function FilterRealtors({ filter, onChange }: FilterRealtorsProps) {
  const { t } = useTranslation();

  const setFilterValue = useCallback(
    (value: Partial<RealtorFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={12}>
        <CustomTextField
          label={t("entities.realtor.filter.nameLike")}
          value={filter.nameLike || ""}
          onChange={(value) => setFilterValue({ nameLike: value || undefined })}
          delay={500}
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
