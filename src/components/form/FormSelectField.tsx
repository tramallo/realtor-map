import { Button, FormGroup, MenuItem, TextField } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

export interface Option {
  label: string;
  value: string;
}

export interface FormSelectFieldProps {
  fieldName: string;
  options: Option[];
  label?: string;
  defaultValue?: string;
  emptyOptionLabel?: string;
  readOnly?: boolean;
  multiple?: boolean;
  actionButtonLabel?: string | JSX.Element;
  actionButtonOnClick?: () => void;
}

export default function FormSelectField({
  fieldName,
  options,
  label,
  emptyOptionLabel,
  readOnly,
  multiple,
  actionButtonLabel,
  actionButtonOnClick,
}: FormSelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field: { value, ...field }, fieldState }) => (
        <FormGroup row>
          <TextField
            {...field}
            value={value || (multiple ? [] : "")}
            label={label}
            variant="outlined"
            select
            disabled={readOnly}
            error={!!fieldState?.error}
            helperText={fieldState?.error?.message}
            slotProps={{
              input: {
                sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }),
              },
              select: { multiple: multiple },
            }}
            sx={{ flex: 9 }}
          >
            {emptyOptionLabel && (
              <MenuItem value="">{emptyOptionLabel ?? "..."}</MenuItem>
            )}
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
