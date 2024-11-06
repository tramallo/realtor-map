import {
  ArrayPath,
  Controller,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./SelectField.css";

export interface Option<T> {
  label: string;
  value: T;
}

export interface SelectFieldProps<
  Schema extends FieldValues,
  SchemaFieldName extends Path<Schema> | ArrayPath<Schema> = Path<Schema>,
  SchemaFieldValue extends PathValue<Schema, SchemaFieldName> = PathValue<
    Schema,
    SchemaFieldName
  >
> {
  fieldName: SchemaFieldName;
  label?: string;
  defaultValue?: SchemaFieldValue;
  options: Option<SchemaFieldValue>[];
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
