import { Button, Stack, Typography } from "@mui/material";

import { useAuthContext } from "../components/AuthContext";

export function UserMenu() {
  const { endSession } = useAuthContext();

  return (
    <Stack
      padding={1}
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
      height="100%"
      boxSizing="border-box"
      justifyContent="space-between"
    >
      <Typography>Content...</Typography>
      <Button variant="contained" color="warning" onClick={endSession}>
        Logout
      </Button>
    </Stack>
  );
}
