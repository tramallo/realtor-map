import { Controller, useFormContext } from "react-hook-form";
import { TextField } from "@mui/material";

interface MuiTextFieldProps {
  fieldName: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
}

export default function MuiTextField({
  fieldName,
  label,
  placeholder = "",
  defaultValue = "",
  readOnly = false,
}: MuiTextFieldProps) {
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
          placeholder={placeholder}
          variant="filled"
          fullWidth
          disabled={readOnly}
          error={!!fieldState?.error}
          helperText={fieldState?.error?.message}
        />
      )}
    />
  );
}
