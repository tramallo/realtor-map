import { Box, InputAdornment, TextField } from "@mui/material";

export interface ChipFieldProps {
  label: string;
  chips: React.ReactElement[];
}

export default function ChipField({ label, chips }: ChipFieldProps) {
  return (
    <TextField
      variant="filled"
      value={""}
      label={label}
      fullWidth
      slotProps={{
        htmlInput: {
          sx: { width: 0, paddingInline: 0 },
        },
        inputLabel: { shrink: !!chips.length },
        input: {
          startAdornment: !chips.length ? (
            ""
          ) : (
            <InputAdornment
              position="start"
              sx={(theme) => ({
                width: "100%",
                maxHeight: "unset",
                marginTop: `${theme.spacing(3)} !important`,
                marginBottom: theme.spacing(1),
              })}
            >
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  width: "100%",
                  gap: 1,
                }}
              >
                {...chips}
              </Box>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
