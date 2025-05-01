import { ReactElement } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";

export interface ComponentsFieldProps {
  components: ReactElement[];
  label?: string;
  onActionButtonClick?: () => void;
  errorMessage?: string;
  readOnly?: boolean;
}

export default function ComponentsField({
  components: chips,
  label,
  onActionButtonClick,
  errorMessage,
  readOnly,
}: ComponentsFieldProps) {
  return (
    <TextField
      variant="outlined"
      value={""}
      label={label}
      error={!!errorMessage}
      helperText={errorMessage}
      fullWidth
      disabled={readOnly}
      slotProps={{
        htmlInput: {
          sx: { width: 0, paddingInline: 0 },
        },
        inputLabel: { shrink: !!chips.length },
        input: {
          sx: onActionButtonClick ? { paddingRight: 0 } : undefined,
          startAdornment: (
            <InputAdornment
              position="start"
              sx={(theme) => ({
                width: "100%",
                maxHeight: "unset",
                marginTop: `${theme.spacing(1)} !important`,
                marginBottom: theme.spacing(1),
                overflow: "hidden",
              })}
            >
              {...chips}
            </InputAdornment>
          ),
          endAdornment: onActionButtonClick ? (
            <InputAdornment position="end" sx={{ margin: 0 }}>
              <IconButton onClick={onActionButtonClick}>
                <ViewListIcon />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
