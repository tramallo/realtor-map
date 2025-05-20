import { memo, useMemo, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";

import Navigation, { NavigationSlide } from "./components/Navigation";
import { PropertiesLayout } from "./layouts/PropertiesLayout";
import { ContractsLayout } from "./layouts/ContractsLayout";
import { RealtorsLayout } from "./layouts/RealtorsLayout";
import { ClientsLayout } from "./layouts/ClientsLayout";
import CustomModal from "./components/CustomModal";
import { UserMenu } from "./layouts/UserMenu";

export function App() {
  const { t } = useTranslation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const slides: NavigationSlide[] = useMemo(
    () => [
      { label: t("layouts.properties.label"), component: <PropertiesLayout /> },
      { label: t("layouts.clients.label"), component: <ClientsLayout /> },
      { label: t("layouts.realtors.label"), component: <RealtorsLayout /> },
      { label: t("layouts.contracts.label"), component: <ContractsLayout /> },
    ],
    [t]
  );

  return (
    <>
      <Navigation
        slides={slides}
        actions={[
          {
            label: "menu",
            icon: <SettingsIcon />,
            callback: () => setUserMenuOpen(true),
          },
        ]}
      />
      <CustomModal
        title="User menu"
        open={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        slideDirection="left"
      >
        <UserMenu />
      </CustomModal>
    </>
  );
}

export const MemoApp = memo(App);
