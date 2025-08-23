import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";
import { useTranslation } from "react-i18next";

import { ContractFilter } from "../../utils/data-filter-schema";
import FilterBaseData from "../FilterBaseData";
import ClientField from "../ClientField";
import PropertyField from "../PropretyField";
import DateField from "../DateField";

export interface FilterContractsProps {
  filter: ContractFilter;
  onChange: (newValue: ContractFilter) => void;
}

export function FilterContracts({ filter, onChange }: FilterContractsProps) {
  const { t } = useTranslation();

  const setFilterValue = useCallback(
    (value: Partial<ContractFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={4}>
        <ClientField
          label={t("entities.contract.filter.clientEq")}
          selected={filter.clientEq ? [filter.clientEq] : []}
          onSelect={(newValue) => setFilterValue({ clientEq: newValue[0] })}
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label={t("entities.contract.filter.startBefore")}
          value={filter.startBefore}
          onChange={(newValue) =>
            setFilterValue({ startBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label={t("entities.contract.filter.startAfter")}
          value={filter.startAfter}
          onChange={(newValue) =>
            setFilterValue({ startAfter: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <PropertyField
          label={t("entities.contract.filter.propertyEq")}
          selected={filter.propertyEq ? [filter.propertyEq] : []}
          onSelect={(newValue) => setFilterValue({ propertyEq: newValue[0] })}
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label={t("entities.contract.filter.endBefore")}
          value={filter.endBefore}
          onChange={(newValue) =>
            setFilterValue({ endBefore: newValue ?? undefined })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <DateField
          label={t("entities.contract.filter.endAfter")}
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
