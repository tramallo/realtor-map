import { memo, useCallback } from "react";
import { ContractFilter } from "../../utils/data-filter-schema";
import { Grid2 } from "@mui/material";
import FilterBaseData from "../FilterBaseData";
import PersonField from "../PersonField";
import PropertyField from "../PropretyField";
import DateField from "../DateField";

export interface FilterConractsProps {
  filter: ContractFilter;
  onChange: (newValue: ContractFilter) => void;
}

export function FilterContracts({ filter, onChange }: FilterConractsProps) {
  console.log(
    `FilterContracts -> render - defaultFilter: ${JSON.stringify(filter)}`
  );

  const setFilterValue = useCallback(
    (value: Partial<ContractFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={2}>
        <PersonField
          label="Client"
          selected={filter.client ? [filter.client] : []}
          onSelect={(newValue) => setFilterValue({ client: newValue[0] })}
        />
      </Grid2>
      <Grid2 size={2}>
        <PropertyField
          label="Property"
          selected={filter.property ? [filter.property] : []}
          onSelect={(newValue) => setFilterValue({ property: newValue[0] })}
        />
      </Grid2>
      <Grid2 size={2}>
        <DateField
          label="Start before"
          value={filter.startBefore}
          onChange={(newValue) =>
            setFilterValue({ startBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={2}>
        <DateField
          label="Start after"
          value={filter.startAfter}
          onChange={(newValue) =>
            setFilterValue({ startAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={2}>
        <DateField
          label="End before"
          value={filter.endBefore}
          onChange={(newValue) =>
            setFilterValue({ endBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={2}>
        <DateField
          label="End after"
          value={filter.endAfter}
          onChange={(newValue) =>
            setFilterValue({ endAfter: newValue ?? undefined })
          }
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

export const MemoFilterContracts = memo(FilterContracts);
