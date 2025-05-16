import { memo, useCallback } from "react";
import {
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

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

export interface FilterPropertiesProps {
  filter: PropertyFilter;
  onChange: (newValue: PropertyFilter) => void;
}

export function FilterProperties({ filter, onChange }: FilterPropertiesProps) {
  console.log(
    `FilterProperties -> render - defaultFilter: ${JSON.stringify(filter)}`
  );

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
          label="Address"
          variant="outlined"
          value={filter.address || ""}
          delay={500}
          onChange={(value) => setFilterValue({ address: value || undefined })}
          fullWidth
        />
      </Grid2>
      <Grid2 size={3}>
        <FormControl fullWidth>
          <InputLabel id="FilterProperties-Select-State-label">
            State
          </InputLabel>
          <Select
            labelId="FilterProperties-Select-State-label"
            label="State"
            value={filter.state || ""}
            variant="outlined"
            onChange={(e) =>
              setFilterValue({ state: e.target.value as PropertyState })
            }
            sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
          >
            <MenuItem value={undefined}>_</MenuItem>
            {propertyStates.map((propertyState, index) => (
              <MenuItem
                key={`select-${propertyState}-${index}`}
                value={propertyState}
              >
                {propertyState}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid2>
      <Grid2 size={3}>
        <FormControl fullWidth>
          <InputLabel id="FilterProperties-Select-Type-label">Type</InputLabel>
          <Select
            labelId="FilterProperties-Select-Type-label"
            label="Type"
            value={filter.type || ""}
            variant="outlined"
            onChange={(e) =>
              setFilterValue({ type: e.target.value as PropertyType })
            }
            sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
          >
            <MenuItem value={undefined}>_</MenuItem>
            {propertyTypes.map((propertyType, index) => (
              <MenuItem
                key={`select-${propertyType}-${index}`}
                value={propertyType}
              >
                {propertyType}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid2>
      <Grid2 size={3}>
        <ClientField
          label="Owner"
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
          label="Exclusive realtor"
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
          label="Related realtors"
          multiple
          selected={filter.relatedRealtorIds ?? []}
          onSelect={(newValue) =>
            setFilterValue({
              relatedRealtorIds: newValue.length ? newValue : undefined,
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
