import { Controller, useFormContext } from "react-hook-form";

import RealtorField from "../RealtorField";

export interface FormRealtorFieldProps {
  fieldName: string;
  label: string;
  multiple?: boolean;
  readOnly?: boolean;
}

export default function FormRealtorField({
  fieldName,
  label,
  multiple,
  readOnly,
}: FormRealtorFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      render={({ field: { value, onChange }, fieldState: { error } }) => (
        <RealtorField
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
