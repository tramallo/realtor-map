import { useCallback } from "react";
import { Grid2, Switch } from "@mui/material";
import { useTranslation } from "react-i18next";

import { BaseDataFilter } from "../utils/data-filter-schema";
import ComponentsField from "./ComponentsField";
import DateField from "./DateField";
import { CustomTextField } from "./CustomTextField";

export interface FilterBaseDataProps {
  filter: BaseDataFilter;
  onChange: (newValue: BaseDataFilter) => void;
}

export default function FilterBaseData({
  filter,
  onChange,
}: FilterBaseDataProps) {
  const { t } = useTranslation();

  const setFilterValue = useCallback(
    (value: Partial<BaseDataFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={3}>
        <CustomTextField
          label={t("entities.base.filter.createdByEq")}
          value={filter.createdByEq ?? ""}
          delay={500}
          onChange={(value) => setFilterValue({ createdByEq: value })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label={t("entities.base.filter.createdBefore")}
          value={filter.createdAtBefore}
          onChange={(newValue) =>
            setFilterValue({ createdAtBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label={t("entities.base.filter.createdAfter")}
          value={filter.createdAtAfter}
          onChange={(newValue) =>
            setFilterValue({ createdAtAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label={t("entities.base.filter.idEq")}
          value={filter.idEq ? filter.idEq.join(", ") : ""}
          delay={500}
          onChange={(value) =>
            setFilterValue({
              idEq: value
                ? value.replace(" ", "").split(",").map(Number)
                : undefined,
            })
          }
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label={t("entities.base.filter.updatedByEq")}
          value={filter.updatedByEq ?? ""}
          delay={500}
          onChange={(value) => setFilterValue({ updatedByEq: value })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label={t("entities.base.filter.updatedBefore")}
          value={filter.updatedAtBefore}
          onChange={(newValue) =>
            setFilterValue({ updatedAtBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label={t("entities.base.filter.updatedAfter")}
          value={filter.updatedAtAfter}
          onChange={(newValue) =>
            setFilterValue({ updatedAtAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <ComponentsField
          label={t("entities.base.filter.deletedEq")}
          components={[
            <Switch
              checked={filter.deletedEq !== undefined}
              size="small"
              onChange={(e) =>
                setFilterValue({
                  deletedEq: e.target.checked ? false : undefined,
                })
              }
            />,
          ]}
        />
      </Grid2>
    </Grid2>
  );
}
