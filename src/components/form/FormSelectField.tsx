import { FieldError, useFormContext } from "react-hook-form";

import "./FormSelectField.css";

export interface FormSelectFieldProps {
  fieldName: string;
  options: readonly string[];
  label?: string;
  defaultOption?: string;
  addEmptyOption?: boolean;
  readOnly?: boolean;
}

export default function FormSelectField({
  fieldName,
  options,
  label,
  defaultOption,
  addEmptyOption,
  readOnly,
}: FormSelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[fieldName] as FieldError | undefined;

  return (
    <div className="form-select-field">
      <label>{label ?? fieldName}</label>
      <select
        className={readOnly ? "read-only" : ""}
        {...register(fieldName)}
        defaultValue={defaultOption}
      >
        {addEmptyOption && (
          <option value="" disabled={readOnly}>
            ...
          </option>
        )}
        {options.map((option, index) => (
          <option
            key={`${fieldName}-${index}`}
            value={option}
            disabled={readOnly}
          >
            {option}
          </option>
        ))}
      </select>
      {error && <span>{error.message}</span>}
    </div>
  );
}
