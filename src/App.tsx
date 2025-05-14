import { memo } from "react";

import Navigation, { NavigationSlide } from "./components/Navigation";
import SearchPersons from "./components/persons/SearchPersons";
import SearchRealtors from "./components/realtors/SearchRealtors";
import { Button } from "@mui/material";
import { useAuthContext } from "./utils/helperFunctions";
import { CalendarContracts } from "./components/contracts/CalendarContracts";
import SearchContracts from "./components/contracts/SearchContracts";
//import Test from "./layouts/Test";
import { PropertiesLayout } from "./layouts/PropertiesLayout";

export function App() {
  const { endSession } = useAuthContext();

  const slides: NavigationSlide[] = [
    { label: "Properties", component: <PropertiesLayout /> },
    { label: "Calendar", component: <CalendarContracts /> },
    { label: "Persons", component: <SearchPersons /> },
    { label: "Realtors", component: <SearchRealtors /> },
    { label: "Contracts", component: <SearchContracts /> },
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
