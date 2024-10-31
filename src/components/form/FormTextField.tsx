import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import "./FormTextField.css";

export interface FormTextFieldProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export default function FormTextField({
  registration,
  validationError,
  label,
  value,
  placeholder,
  readOnly,
}: FormTextFieldProps) {
  return (
    <div className="form-text-field">
      <label>{label ?? registration.name}</label>
      <input
        type="text"
        {...registration}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
