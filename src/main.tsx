import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./main.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import { MemoApp } from "./App.tsx";
import { AppContextProvider } from "./components/AppContext.tsx";
import { AuthContextProvider } from "./components/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
  <AuthContextProvider>
    <AppContextProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MemoApp />
      </LocalizationProvider>
    </AppContextProvider>
  </AuthContextProvider>
  //</StrictMode>
);
