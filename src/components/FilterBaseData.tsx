import { useCallback } from "react";
import { Grid2, Switch } from "@mui/material";

import { BaseFilterData } from "../utils/domainSchemas";
import PersonField from "./PersonField";
import ComponentsField from "./ComponentsField";
import DateField from "./DateField";

export interface FilterBaseDataProps {
  filter: BaseFilterData;
  onChange: (newValue: BaseFilterData) => void;
}

export default function FilterBaseData({
  filter,
  onChange,
}: FilterBaseDataProps) {
  const setFilterValue = useCallback(
    (value: Partial<BaseFilterData>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={4}>
        <PersonField
          label="Created by"
          selected={filter.createdBy ? [filter.createdBy] : []}
          onSelect={(newValue) => setFilterValue({ createdBy: newValue[0] })}
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label="Created before"
          value={filter.createdAtBefore}
          onChange={(newValue) =>
            setFilterValue({ createdAtBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label="Created after"
          value={filter.createdAtAfter}
          onChange={(newValue) =>
            setFilterValue({ createdAtAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <PersonField
          label="Updated by"
          selected={filter.updatedBy ? [filter.updatedBy] : []}
          onSelect={(newValue) => setFilterValue({ updatedBy: newValue[0] })}
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
      <Grid2 size={2}>
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
