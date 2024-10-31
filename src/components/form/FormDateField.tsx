import { FieldError, useFormContext } from "react-hook-form";

import "./FormDateField.css";
import { format as formatDate } from "date-fns";

export interface FormDateFieldProps {
  fieldName: string;
  label?: string;
  value?: Date;
  readOnly?: boolean;
}

export default function FormDateField({
  fieldName,
  label,
  value,
  readOnly,
}: FormDateFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[fieldName] as FieldError | undefined;

  return (
    <div className="form-date-field">
      <label>{label ?? fieldName}</label>
      <input
        type="date"
        {...register(fieldName)}
        value={value && formatDate(value, "yyyy-MM-dd")}
        readOnly={readOnly}
      />
      {error && <span>{error.message}</span>}
    </div>
  );
}
