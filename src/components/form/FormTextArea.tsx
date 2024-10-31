import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import "./FormTextArea.css";

export interface FormTextAreaProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  readOnly?: boolean;
}

export default function FormTextArea({
  registration,
  validationError,
  label,
  readOnly,
}: FormTextAreaProps) {
  return (
    <div className="form-text-area">
      <label>{label ?? registration.name}</label>
      <textarea {...registration} readOnly={readOnly} />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
