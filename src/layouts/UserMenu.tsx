import { useTranslation } from "react-i18next";
import { Button, Stack } from "@mui/material";

import { AppSettingsPane } from "../components/AppSettingsPane";
import { useAuthStore } from "../stores/authStore";

export function UserMenu() {
  const { t } = useTranslation();
  const endSession = useAuthStore(store => store.endSession);

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
        {t("buttons.logoutButton.label")}
      </Button>
    </Stack>
  );
}
