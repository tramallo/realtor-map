import { useState, useEffect, useRef, forwardRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";

//default onChange definition is omitted so the custom one is the only expected by ts
export type CustomTextFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onChange?: (value: string) => void;
  delay?: number;
};

export const CustomTextField = forwardRef<
  HTMLInputElement,
  CustomTextFieldProps
>(({ value, onChange = () => undefined, delay, ...props }, ref) => {
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (!onChange) {
      return;
    }

    if (!delay) {
      onChange(newValue);
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, delay);
  };

  //syncExternalValueChange effect
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  //cleanupDebounceTimer effect
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <TextField
      value={inputValue}
      onChange={onInputChange}
      variant="outlined"
      minRows={props.multiline ? 3 : undefined}
      inputRef={ref}
      slotProps={{
        input: {
          sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }),
        },
        inputLabel: {
          sx: (theme) => ({
            backgroundColor: theme.palette.grey[200],
            borderRadius: 3,
            paddingInline: 1,
          }),
        },
      }}
      {...props}
    />
  );
});
