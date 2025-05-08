import { useCallback } from "react";
import { Grid2, Switch } from "@mui/material";

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
          label="Created by"
          value={filter.createdBy ?? ""}
          delay={500}
          onChange={(value) => setFilterValue({ createdBy: value })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label="Created before"
          value={filter.createdAtBefore}
          onChange={(newValue) =>
            setFilterValue({ createdAtBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label="Created after"
          value={filter.createdAtAfter}
          onChange={(newValue) =>
            setFilterValue({ createdAtAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomTextField
          label="Id"
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
          label="Updated by"
          value={filter.updatedBy ?? ""}
          delay={500}
          onChange={(value) => setFilterValue({ updatedBy: value })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label="Updated before"
          value={filter.updatedAtBefore}
          onChange={(newValue) =>
            setFilterValue({ updatedAtBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <DateField
          label="Updated after"
          value={filter.updatedAtAfter}
          onChange={(newValue) =>
            setFilterValue({ updatedAtAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={3}>
        <ComponentsField
          label="Hide deleted"
          components={[
            <Switch
              checked={filter.deleted !== undefined}
              size="small"
              onChange={(e) =>
                setFilterValue({
                  deleted: e.target.checked ? false : undefined,
                })
              }
            />,
          ]}
        />
      </Grid2>
    </Grid2>
  );
}
