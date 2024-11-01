import { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { format as formatDate } from "date-fns";

import "./DateField.css";

export interface DateFieldProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  value?: Date;
  readOnly?: boolean;
}

export default function DateField({
  registration,
  validationError,
  label,
  value,
  readOnly,
}: DateFieldProps) {
  return (
    <div className="date-field">
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
