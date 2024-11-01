import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import "./SelectField.css";

export interface Option {
  label: string;
  value: string;
}

export interface SelectFieldProps {
  registration: UseFormRegisterReturn<string>;
  validationError: FieldError | undefined;
  options: Option[];
  label?: string;
  defaultOption?: string;
  addEmptyOption?: boolean;
  readOnly?: boolean;
}

export default function SelectField({
  registration,
  validationError,
  options,
  label,
  defaultOption,
  addEmptyOption,
  readOnly,
}: SelectFieldProps) {
  return (
    <div className="select-field">
      <label>{label ?? registration.name}</label>
      <select
        className={readOnly ? "read-only" : ""}
        {...registration}
        defaultValue={defaultOption}
      >
        {addEmptyOption && (
          <option value="" disabled={readOnly}>
            ...
          </option>
        )}
        {options.map((option, index) => (
          <option
            key={`${registration.name}-${index}`}
            value={option.value}
            disabled={readOnly}
          >
            {option.label}
          </option>
        ))}
      </select>
      {validationError && <span>{validationError.message}</span>}
    </div>
  );
}
