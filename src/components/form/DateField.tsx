import { useFormContext, Controller } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";

import "./DateField.css";
import { format, isValid, parse } from "date-fns";

export const dateToString = (date: Date | null | undefined): string => {
  if (!date || !isValid(date)) {
    return "";
  }

  return format(date, "yyyy-MM-dd"); 
}

export const stringToDate = (dateString: string | undefined): Date | null => {
  if (!dateString) {
    return null;
  }

  const date = parse(dateString, "yyyy-MM-dd", new Date());

  if (!isValid(date)) {
    return null;
  }

  return date;
}

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
      defaultValue={dateToString(defaultValue) || ""}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <DatePicker
          {...field}
          value={stringToDate(value)}
          onChange={(newDate) => onChange(dateToString(newDate))}
          disabled={readOnly}
          label={label}
          slotProps={{
            textField: {
              variant: "filled",
              fullWidth: true,
              error: !!fieldState?.error,
              helperText: `${fieldState.error?.message ?? ''}: ${fieldState.error?.type ?? ''}`,
            },
          }}
        />
      )}
    />
  );
}
