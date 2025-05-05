import { Controller, useFormContext } from "react-hook-form";

import PropertyField from "../PropretyField";

export interface FormPropertyFieldProps {
  fieldName: string;
  label: string;
  multiple?: boolean;
  readOnly?: boolean;
}

export default function FormPropertyField({
  fieldName,
  label,
  multiple,
  readOnly,
}: FormPropertyFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <PropertyField
          label={label}
          selected={value ? (multiple ? value : [value]) : []}
          onSelect={(newSelected) =>
            multiple ? onChange(newSelected) : onChange(newSelected[0])
          }
          multiple={multiple}
          errorMessage={error?.message}
          readOnly={readOnly}
        />
      )}
    />
  );
}
