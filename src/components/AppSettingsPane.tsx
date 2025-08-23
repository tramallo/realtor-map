import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { supportedLanguages } from "../translations";
import { CustomSelectField } from "./CustomSelectField";

export function AppSettingsPane() {
  const { t, i18n } = useTranslation();

  return (
    <Stack>
      <CustomSelectField
        label={t("fields.languageField.label")}
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value as string)}
        options={supportedLanguages.map((supportedLang) => ({
          label: supportedLang,
          value: supportedLang,
        }))}
      />
    </Stack>
  );
}
