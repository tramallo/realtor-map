import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { format as formatDate } from "date-fns";

import "./FormDateField.css";

export interface FormDateFieldProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  value?: Date;
  readOnly?: boolean;
}

export default function FormDateField({
  registration,
  validationError,
  label,
  value,
  readOnly,
}: FormDateFieldProps) {
  return (
    <div className="form-date-field">
      <label>{label ?? registration.name}</label>
      <input
        type="date"
        {...registration}
        value={value && formatDate(value, "yyyy-MM-dd")}
        readOnly={readOnly}
      />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
