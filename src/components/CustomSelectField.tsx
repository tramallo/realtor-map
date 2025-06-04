import { useId } from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from "@mui/material";

export type SelectFieldOption<T extends string> = {
  label: string;
  value: T;
};

export type CustomSelectFieldProps<OValue extends string> = Omit<
  SelectProps,
  "onChange" | "value"
> & {
  value: OValue | undefined;
  onChange: (newValue: OValue) => void;
  options: Array<SelectFieldOption<OValue>>;
  emptyOptionLabel?: string;
};

export function CustomSelectField<TValue extends string = string>({
  value,
  onChange,
  options,
  emptyOptionLabel,
  ...selectProps
}: CustomSelectFieldProps<TValue>) {
  const labelId = useId();

  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{selectProps.label}</InputLabel>
      <Select
        labelId={labelId}
        variant="outlined"
        value={value ?? ""}
        onChange={(event) =>
          onChange((event.target.value as TValue) ?? undefined)
        }
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
        {...selectProps}
      >
        {emptyOptionLabel && <MenuItem value="">{emptyOptionLabel}</MenuItem>}
        {options.map(({ label, value }, index) => (
          <MenuItem key={`select-${label}-${index}`} value={value}>
            {label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
