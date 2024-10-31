import { FieldError, useFormContext } from "react-hook-form";

import "./FormTextArea.css";

export interface FormTextAreaProps {
  fieldName: string;
  label?: string;
  readOnly?: boolean;
}

export default function FormTextArea({
  fieldName,
  label,
  readOnly,
}: FormTextAreaProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[fieldName] as FieldError | undefined;

  return (
    <div className="form-text-area">
      <label>{label ?? fieldName}</label>
      <textarea {...register(fieldName)} readOnly={readOnly} />
      {error && <span>{error.message}</span>}
    </div>
  );
}
