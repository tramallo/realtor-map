import { useCallback, useState } from "react";
import { Button, CircularProgress, Stack, Typography } from "@mui/material";

import { CustomTextField } from "./CustomTextField";
import { useAuthContext } from "./AuthContext";

export function LoginPane() {
  const { startSession } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [startingSession, setStartingSession] = useState(false);

  const [signInError, setSignInError] = useState(
    undefined as Error | undefined
  );

  const handleLogin = useCallback(async () => {
    setStartingSession(true);
    const startSessionResponse = await startSession(email, password);
    setStartingSession(false);

    if (startSessionResponse.error) {
      setSignInError(startSessionResponse.error);
      return;
    }
  }, [email, password, startSession]);

  return (
    <Stack spacing={2} padding={1}>
      <CustomTextField
        label="Email"
        value={email}
        onChange={setEmail}
        disabled={startingSession}
      />
      <CustomTextField
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        disabled={startingSession}
      />
      {signInError && (
        <Typography color="error">{signInError.message}</Typography>
      )}
      <Stack direction="row" spacing={2} justifyContent="end">
        <Button
          variant="contained"
          onClick={handleLogin}
          disabled={startingSession}
        >
          {startingSession ? <CircularProgress size="1.4em" /> : "Login"}
        </Button>
      </Stack>
    </Stack>
  );
}
