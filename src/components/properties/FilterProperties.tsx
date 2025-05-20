import { memo, useCallback } from "react";
import { Grid2 } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  PropertyState,
  propertyStates,
  PropertyType,
  propertyTypes,
} from "../../utils/data-schema";
import ClientField from "../ClientField";
import RealtorField from "../RealtorField";
import FilterBaseData from "../FilterBaseData";
import { CustomTextField } from "../CustomTextField";
import { PropertyFilter } from "../../utils/data-filter-schema";
import { CustomSelectField } from "../CustomSelectField";

export interface FilterPropertiesProps {
  filter: PropertyFilter;
  onChange: (newValue: PropertyFilter) => void;
}

export function FilterProperties({ filter, onChange }: FilterPropertiesProps) {
  const { t } = useTranslation();

  const setFilterValue = useCallback(
    (value: Partial<PropertyFilter>) => {
      onChange({ ...filter, ...value });
    },
    [filter, onChange]
  );

  return (
    <Grid2 container spacing={1}>
      <Grid2 size={6}>
        <CustomTextField
          label={t("entities.property.filter.addressLike")}
          variant="outlined"
          value={filter.addressLike || ""}
          delay={500}
          onChange={(value) =>
            setFilterValue({ addressLike: value || undefined })
          }
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomSelectField
          label={t("entities.property.filter.stateEq")}
          value={filter.stateEq || ""}
          onChange={(e) =>
            setFilterValue({ stateEq: e.target.value as PropertyState })
          }
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
        />
      </Grid2>
      <Grid2 size={3}>
        <CustomSelectField
          label={t("entities.property.filter.typeEq")}
          value={filter.typeEq || ""}
          onChange={(e) =>
            setFilterValue({ typeEq: e.target.value as PropertyType })
          }
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
        />
      </Grid2>
      <Grid2 size={3}>
        <ClientField
          label={t("entities.property.filter.ownerEq")}
          selected={filter.ownerEq ? [filter.ownerEq] : []}
          onSelect={(newValue) =>
            setFilterValue({
              ownerEq: newValue.length ? newValue[0] : undefined,
            })
          }
        />
      </Grid2>
      <Grid2 size={4}>
        <RealtorField
          label={t("entities.property.filter.exclusiveRealtorEq")}
          selected={
            filter.exclusiveRealtorEq ? [filter.exclusiveRealtorEq] : []
          }
          onSelect={(newValue) => {
            setFilterValue({
              exclusiveRealtorEq: newValue.length ? newValue[0] : undefined,
            });
          }}
        />
      </Grid2>
      <Grid2 size={5}>
        <RealtorField
          label={t("entities.property.filter.relatedRealtorIdsHas")}
          multiple
          selected={filter.relatedRealtorIdsHas ?? []}
          onSelect={(newValue) =>
            setFilterValue({
              relatedRealtorIdsHas: newValue.length ? newValue : undefined,
            })
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

export const MemoFilterProperties = memo(FilterProperties);
