import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import "./TextField.css";

export interface TextFieldProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export default function TextField({
  registration,
  validationError,
  label,
  value,
  placeholder,
  readOnly,
}: TextFieldProps) {
  return (
    <div className="text-field">
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
