import { useFormContext, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";

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
    <Controller
      name={fieldName}
      control={control}
      defaultValue={defaultValue || null}
      render={({ field, fieldState }) => (
        <DatePicker
          {...field}
          disabled={readOnly}
          label={label}
          slotProps={{
            textField: {
              variant: "filled",
              fullWidth: true,
              error: !!fieldState?.error,
              helperText: fieldState?.error?.message,
            },
          }}
        />
      )}
    />
  );
}
