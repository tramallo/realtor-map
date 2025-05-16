import { memo, useMemo, useState } from "react";
import { Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

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
    <Navigation slides={slides}>
      <Button
        variant="contained"
        color="info"
        onClick={() => setUserMenuOpen(true)}
        sx={{ flex: 1 }}
      >
        <PersonIcon />
      </Button>
      <CustomModal
        title="User menu"
        open={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        slideDirection="left"
      >
        <UserMenu />
      </CustomModal>
    </Navigation>
  );
}

export const MemoApp = memo(App);
