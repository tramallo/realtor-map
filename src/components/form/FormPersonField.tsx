import { Controller, useFormContext } from "react-hook-form";

import ClientField from "../ClientField";

export interface FormPersonFieldProps {
  fieldName: string;
  label: string;
  multiple?: boolean;
  readOnly?: boolean;
}

export default function FormPersonField({
  fieldName,
  label,
  multiple,
  readOnly,
}: FormPersonFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <ClientField
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
