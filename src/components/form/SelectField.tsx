import {
  Controller,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./SelectField.css";

export interface Option {
  label: string;
  value: string;
}

export interface SelectFieldProps<Schema extends FieldValues> {
  fieldName: Path<Schema>;
  options: Option[];
  label?: string;
  defaultValue?: PathValue<Schema, Path<Schema>>;
  emptyOptionLabel?: string;
}

export default function SelectField<Schema extends FieldValues>({
  fieldName,
  options,
  label,
  defaultValue,
  emptyOptionLabel,
}: SelectFieldProps<Schema>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<Schema>();

  const error = errors[fieldName] as FieldError | undefined;

  return (
    <div className="select-field">
      {label && <label>{label}</label>}
      <Controller
        name={fieldName}
        control={control}
        defaultValue={defaultValue}
        render={({ field }) => (
          <select {...field}>
            {emptyOptionLabel && <option value="">{emptyOptionLabel}</option>}
            {options.map((option, index) => (
              <option key={`${name}-option-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}
      />
      {error && <span>{error.message}</span>}
    </div>
  );
}
