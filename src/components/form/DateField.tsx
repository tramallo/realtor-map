import { useFormContext, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import "./DateField.css";

export interface DateFieldProps {
  fieldName: string;
  label?: string;
  defaultValue?: Date;
  readOnly?: boolean;
}

export default function DateField({
  fieldName,
  label,
  defaultValue,
  readOnly,
}: DateFieldProps) {
  const { control } = useFormContext();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Controller
        name={fieldName}
        control={control}
        defaultValue={defaultValue || null}
        render={({ field, fieldState }) => (
          <DatePicker
            {...field}
            disabled={readOnly}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!fieldState?.error}
                helperText={fieldState?.error ? fieldState.error.message : ""}
                fullWidth
              />
            )}
          />
        )}
      />
    </LocalizationProvider>
  );
}
