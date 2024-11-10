import {
  Controller,
  useFormContext,
} from "react-hook-form";

import "./SelectField.css";
import { MenuItem, TextField } from "@mui/material";

export interface Option {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  fieldName: string;
  options: Option[];
  label?: string;
  defaultValue?: string;
  emptyOptionLabel?: string;
  readOnly?: boolean;
}

export default function SelectField({
  fieldName,
  options,
  label,
  defaultValue,
  emptyOptionLabel,
  readOnly,
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
      <Controller
        name={fieldName}
        control={control}
        defaultValue={defaultValue}
        render={({ field, fieldState }) => (
          <TextField 
            {...field} 
            label={label} 
            variant="filled" 
            fullWidth select
            disabled={readOnly}
            error={!!fieldState?.error}
            helperText={fieldState?.error?.message}
          >
            <MenuItem value="">{emptyOptionLabel ?? "..."}</MenuItem>
            {options.map((option, index) => (
              <MenuItem key={`${fieldName}-option-${index}`} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
  );
}
