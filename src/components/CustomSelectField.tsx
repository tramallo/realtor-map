import { useId } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";

export type CustomSelectFieldProps = SelectProps & {
  options: Array<{ label: string; value: string }>;
};

export function CustomSelectField({
  options,
  ...selectProps
}: CustomSelectFieldProps) {
  const labelId = useId();

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{selectProps.label}</InputLabel>
      <Select
        labelId={labelId}
        variant="outlined"
        {...selectProps}
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      >
        {options.map(({ label, value }, index) => (
          <MenuItem key={`select-${label}-${index}`} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
