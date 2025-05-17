import { memo, useMemo, useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";

import Navigation, { NavigationSlide } from "./components/Navigation";
import { PropertiesLayout } from "./layouts/PropertiesLayout";
import { ContractsLayout } from "./layouts/ContractsLayout";
import { RealtorsLayout } from "./layouts/RealtorsLayout";
import { ClientsLayout } from "./layouts/ClientsLayout";
import CustomModal from "./components/CustomModal";
import { UserMenu } from "./layouts/UserMenu";

export function App() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const slides: NavigationSlide[] = useMemo(
    () => [
      { label: "Properties", component: <PropertiesLayout /> },
      { label: "Clients", component: <ClientsLayout /> },
      { label: "Realtors", component: <RealtorsLayout /> },
      { label: "Contracts", component: <ContractsLayout /> },
    ],
    []
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
