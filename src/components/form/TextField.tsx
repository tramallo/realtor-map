import {
  ArrayPath,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./TextField.css";

export interface TextFieldProps<
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
  placeholder?: string;
  readOnly?: boolean;
}

export default function TextField<Schema extends FieldValues>({
  fieldName,
  label,
  defaultValue,
  placeholder,
  readOnly,
}: TextFieldProps<Schema>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const validationError = errors[fieldName] as FieldError | undefined;

  return (
    <div className="text-field">
      {label && <label>{label}</label>}
      <input
        type="text"
        {...register(fieldName)}
        value={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
