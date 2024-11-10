import { Controller, useFormContext } from "react-hook-form";
import { Button, FormGroup, MenuItem, TextField } from "@mui/material";

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
  actionButtonLabel?: string | JSX.Element;
  actionButtonOnClick?: () => void;
}

export default function SelectField({
  fieldName,
  options,
  label,
  defaultValue,
  emptyOptionLabel,
  readOnly,
  actionButtonLabel,
  actionButtonOnClick,
}: SelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={defaultValue || ""}
      render={({ field, fieldState }) => (
        <FormGroup row>
          <TextField
            {...field}
            label={label}
            variant="filled"
            select
            disabled={readOnly}
            error={!!fieldState?.error}
            helperText={fieldState?.error?.message}
            sx={{ flex: 9 }}
          >
            <MenuItem value="">{emptyOptionLabel ?? "..."}</MenuItem>
            {options.map((option, index) => (
              <MenuItem
                key={`${fieldName}-option-${index}`}
                value={option.value}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {actionButtonLabel && (
            <Button
              variant="outlined"
              sx={{ flex: 1, whiteSpace: "nowrap" }}
              onClick={actionButtonOnClick}
              disabled={readOnly}
            >
              {actionButtonLabel}
            </Button>
          )}
        </FormGroup>
      )}
    />
  );
}
