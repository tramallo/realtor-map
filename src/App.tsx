import { memo } from "react";

//import MapProperties from "./components/properties/MapProperties";
import Navigation, { NavigationSlide } from "./components/Navigation";
import ListPersons from "./components/persons/ListPersons";
import ListRealtors from "./components/realtors/ListRealtors";
import ListProperties from "./components/properties/ListProperties";
import Test from "./layouts/Test";
import { Button } from "@mui/material";
import { useAuthContext } from "./utils/helperFunctions";

export function App() {
  const { endSession } = useAuthContext();

  const slides: NavigationSlide[] = [
    //{ label: "Map", component: <MapProperties /> },
    { label: "Properties", component: <ListProperties /> },
    { label: "Persons", component: <ListPersons /> },
    { label: "Realtors", component: <ListRealtors /> },
    { label: "test", component: <Test /> },
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
