import { DatePicker } from "@mui/x-date-pickers";

import { dateToTimestamp, timestampToDate } from "../utils/helperFunctions";

export interface DateFieldProps {
  label: string;
  value: number | undefined;
  onChange?: (newValue: number | undefined) => void;
  readOnly?: boolean;
  disabled?: boolean;
  errorMessage?: string;
}

export default function DateField({
  label,
  value,
  onChange,
  readOnly,
  disabled,
  errorMessage,
}: DateFieldProps) {
  return (
    <DatePicker
      label={label}
      value={value ? timestampToDate(value) : null}
      onChange={(newDate) =>
        onChange ? onChange(dateToTimestamp(newDate)) : undefined
      }
      disabled={disabled}
      slotProps={{
        field: {
          clearable: !readOnly && !disabled ? true : false,
          readOnly: true,
        },
        textField: {
          variant: "outlined",
          fullWidth: true,
          error: !!errorMessage,
          helperText: errorMessage,
          sx: (theme) => ({
            "& .MuiOutlinedInput-root": {
              backgroundColor: theme.palette.grey[200],
            },
          }),
        },
        openPickerButton: { disabled: readOnly },
      }}
    />
  );
}
