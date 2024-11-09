import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import App from "./App.tsx";
import ModalContextProvider from "./components/ModalContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ModalContextProvider>
        <App />
      </ModalContextProvider>
    </LocalizationProvider>
  </StrictMode>
);
