import { Controller, useFormContext } from "react-hook-form";
import { SxProps, TextField } from "@mui/material";

interface FormTextFieldProps {
  fieldName: string;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  multiline?: boolean;
  defaultValue?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
  sx?: SxProps;
}
const defaults = {
  fullWidth: true,
};

export default function FormTextField({
  fieldName,
  label,
  placeholder,
  readOnly,
  multiline,
  defaultValue,
  disabled,
  size,
  fullWidth = defaults.fullWidth,
  sx,
}: FormTextFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, ...field }, fieldState }) => (
        <TextField
          {...field}
          value={value || ""}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          fullWidth={fullWidth}
          disabled={disabled}
          multiline={multiline}
          error={!!fieldState?.error}
          helperText={fieldState?.error?.message}
          minRows={multiline ? 3 : undefined}
          size={size}
          sx={sx}
          slotProps={{ input: { readOnly: readOnly } }}
        />
      )}
    />
  );
}
