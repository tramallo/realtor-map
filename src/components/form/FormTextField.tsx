import { Controller, useFormContext } from "react-hook-form";

import { CustomTextField, CustomTextFieldProps } from "../CustomTextField";

type FormTextFieldProps = Omit<CustomTextFieldProps, "value" | "onChange"> & {
  fieldName: string;
  defaultValue?: string;
};

export const FormTextField = ({
  fieldName,
  defaultValue,
  ...props
}: FormTextFieldProps) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={fieldName}
      control={control}
      defaultValue={defaultValue}
      render={({ field: { value, onChange, ...field }, fieldState }) => (
        <CustomTextField
          {...props}
          {...field}
          value={value || ""}
          onChange={onChange}
          error={!!fieldState?.error}
          helperText={fieldState?.error?.message}
        />
      )}
    />
  );
};
