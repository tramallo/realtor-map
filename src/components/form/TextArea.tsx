import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import "./TextArea.css";

export interface TextAreaProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  label?: string;
  readOnly?: boolean;
}

export default function TextArea({
  registration,
  validationError,
  label,
  readOnly,
}: TextAreaProps) {
  return (
    <div className="text-area">
      <label>{label ?? registration.name}</label>
      <textarea {...registration} readOnly={readOnly} />
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
