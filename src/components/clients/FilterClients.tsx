import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";
import { useTranslation } from "react-i18next";

import FilterBaseData from "../FilterBaseData";
import { CustomTextField } from "../CustomTextField";
import { ClientFilter } from "../../utils/data-filter-schema";

export interface FilterClientsProps {
  filter: ClientFilter;
  onChange: (newValue: ClientFilter) => void;
}

export function FilterClients({ filter, onChange }: FilterClientsProps) {
  const { t } = useTranslation();

  const setFilterValue = useCallback(
    (value: Partial<ClientFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={6}>
        <CustomTextField
          label={t("entities.client.filter.nameLike")}
          variant="outlined"
          value={filter.nameLike || ""}
          delay={500}
          onChange={(value) => setFilterValue({ nameLike: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label={t("entities.client.filter.mobileLike")}
          variant="outlined"
          value={filter.mobileLike || ""}
          onChange={(value) =>
            setFilterValue({ mobileLike: value || undefined })
          }
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label={t("entities.client.filter.emailLike")}
          variant="outlined"
          value={filter.emailLike || ""}
          onChange={(value) =>
            setFilterValue({ emailLike: value || undefined })
          }
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

export const MemoFilterPersons = memo(FilterClients);
