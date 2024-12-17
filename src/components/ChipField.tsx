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
      multiline
      slotProps={{
        htmlInput: {
          sx: { width: 0, padding: 0 },
        },
        input: {
          startAdornment: !chips.length ? (
            ""
          ) : (
            <InputAdornment position="start" sx={{ width: "100%" }}>
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
