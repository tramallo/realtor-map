import { FieldError, useFormContext } from "react-hook-form";

import "./FormTextField.css";

export interface FormTextFieldProps {
  fieldName: string;
  label?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export default function FormTextField({
  fieldName,
  label,
  value,
  placeholder,
  readOnly,
}: FormTextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[fieldName] as FieldError | undefined;

  return (
    <div className="form-text-field">
      <label>{label ?? fieldName}</label>
      <input
        type="text"
        {...register(fieldName)}
        value={value}
        placeholder={placeholder}
        readOnly={readOnly}
      />
      {error && <span>{error.message}</span>}
    </div>
  );
}
