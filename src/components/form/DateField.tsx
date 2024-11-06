import {
  ArrayPath,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";
import { format as formatDate } from "date-fns";

import "./DateField.css";

export interface DateFieldProps<
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
  readOnly?: boolean;
}

export default function DateField<Schema extends FieldValues>({
  fieldName,
  label,
  defaultValue,
  readOnly,
}: DateFieldProps<Schema>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const validationError = errors[fieldName] as FieldError | undefined;

  return (
    <div className="date-field">
      {label && <label>{label}</label>}
      <input
        type="date"
        {...register(fieldName)}
        value={defaultValue && formatDate(defaultValue, "yyyy-MM-dd")}
        readOnly={readOnly}
      />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}

export type DateField = typeof DateField;
