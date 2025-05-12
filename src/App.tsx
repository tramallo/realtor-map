import { memo } from "react";

import Navigation, { NavigationSlide } from "./components/Navigation";
import SearchPersons from "./components/persons/SearchPersons";
import SearchRealtors from "./components/realtors/SearchRealtors";
import SearchProperties from "./components/properties/SearchProperties";
import { Button } from "@mui/material";
import { useAuthContext } from "./utils/helperFunctions";
import { CalendarContracts } from "./components/contracts/CalendarContracts";
import MapProperties from "./components/properties/MapProperties";
import SearchContracts from "./components/contracts/SearchContracts";
import Test from "./layouts/Test";

export function App() {
  const { endSession } = useAuthContext();

  const slides: NavigationSlide[] = [
    //{ label: "Map", component: <MapProperties /> },
    //{ label: "Calendar", component: <CalendarContracts /> },
    { label: "test", component: <Test /> },
    { label: "Properties", component: <SearchProperties /> },
    { label: "Persons", component: <SearchPersons /> },
    { label: "Realtors", component: <SearchRealtors /> },
    { label: "Contracts", component: <SearchContracts /> },
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
