import {
  ArrayPath,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./TextArea.css";

export interface TextAreaProps<
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

export default function TextArea<Schema extends FieldValues>({
  fieldName,
  label,
  defaultValue,
  readOnly,
}: TextAreaProps<Schema>) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const validationError = errors[fieldName] as FieldError | undefined;

  return (
    <div className="text-area">
      {label && <label>{label}</label>}
      <textarea
        {...register(fieldName)}
        readOnly={readOnly}
        value={defaultValue}
      />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
