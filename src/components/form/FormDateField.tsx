import { useFormContext, Controller } from "react-hook-form";

import DateField from "../DateField";

export interface FormDateFieldProps {
  fieldName: string;
  label?: string;
  readOnly?: boolean;
  disabled?: boolean;
}

export default function FormDateField({
  fieldName,
  label,
  readOnly,
  disabled,
}: FormDateFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field: { value, onChange }, fieldState }) => (
        <DateField
          label={label || ""}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          disabled={disabled}
          errorMessage={
            fieldState.error
              ? `${fieldState.error.type}: ${fieldState.error.message}`
              : undefined
          }
        />
      )}
    />
  );
}
