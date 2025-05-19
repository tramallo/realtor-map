import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mui/material";

import { useAuthContext } from "../components/AuthContext";
import { AppSettingsPane } from "../components/AppSettingsPane";

export function UserMenu() {
  const { t } = useTranslation();
  const { endSession } = useAuthContext();

  return (
    <Stack
      padding={1}
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
      height="100%"
      boxSizing="border-box"
      justifyContent="space-between"
    >
      <AppSettingsPane />
      <Button variant="contained" color="warning" onClick={endSession}>
        {t("components.layouts.userMenu.logoutButton")}
      </Button>
    </Stack>
  );
}
