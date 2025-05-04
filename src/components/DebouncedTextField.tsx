import { useState, useEffect, useRef } from "react";
import { TextField, TextFieldProps } from "@mui/material";

//default onChange definition is omitted so the custom one is the only expected by ts
type DebouncedTextFieldProps = Omit<TextFieldProps, "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  delay?: number;
};

export function DebouncedTextField({
  value,
  onChange,
  delay = 500,
  ...props
}: DebouncedTextFieldProps) {
  const [inputValue, setInputValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

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
      slotProps={{
        input: {
          sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }),
        },
      }}
      {...props}
    />
  );
}
