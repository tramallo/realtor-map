import { Controller, useFormContext } from "react-hook-form";
import { Option } from "./SelectField";
import { Button, FormGroup, MenuItem, TextField } from "@mui/material";

export interface MultiSelectFieldProps {
  fieldName: string;
  options: Option[];
  label?: string;
  defaultValue?: string[];
  readOnly?: boolean;
  actionButtonLabel?: string | JSX.Element;
  actionButtonOnClick?: () => void;
}

export default function MultiSelectField({
  fieldName,
  options,
  label,
  defaultValue,
  readOnly,
  actionButtonLabel,
  actionButtonOnClick,
}: MultiSelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, ...field }, fieldState }) => (
        <FormGroup row>
          <TextField
            {...field}
            label={label}
            value={value || []}
            variant="filled"
            select
            disabled={readOnly}
            error={!!fieldState?.error}
            helperText={fieldState?.error?.message}
            slotProps={{ select: { multiple: true } }}
            sx={{ flex: 9 }}
          >
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
              onClick={actionButtonOnClick}
              disabled={readOnly}
              sx={{ flex: 1, whiteSpace: "nowrap" }}
            >
              {actionButtonLabel}
            </Button>
          )}
        </FormGroup>
      )}
    />
  );
}
