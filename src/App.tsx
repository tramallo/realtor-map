import { memo } from "react";

import Navigation, { NavigationSlide } from "./components/Navigation";
import { Button } from "@mui/material";
import { useAuthContext } from "./utils/helperFunctions";
//import Test from "./layouts/Test";
import { PropertiesLayout } from "./layouts/PropertiesLayout";
import { ContractsLayout } from "./layouts/ContractsLayout";
import { RealtorsLayout } from "./layouts/RealtorsLayout";
import { PersonsLayout } from "./layouts/PersonsLayout";

export function App() {
  const { endSession } = useAuthContext();

  const slides: NavigationSlide[] = [
    { label: "Properties", component: <PropertiesLayout /> },
    { label: "Persons", component: <PersonsLayout /> },
    { label: "Realtors", component: <RealtorsLayout /> },
    { label: "Contracts", component: <ContractsLayout /> },
    //{ label: "test", component: <Test /> },
  ];

  return (
    <Navigation slides={slides}>
      <Button variant="contained" onClick={endSession} sx={{ flex: 1 }}>
        Logout
      </Button>
    </Navigation>
  );
}

export const MemoApp = memo(App);
