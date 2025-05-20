import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "./main.css";
//import { StrictMode } from "react";
import "./i18n";
import { createRoot } from "react-dom/client";

import { MemoApp } from "./App.tsx";
import { AppContextProvider } from "./components/AppContext.tsx";
import { AuthContextProvider } from "./components/AuthContext.tsx";

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
  <AuthContextProvider>
    <AppContextProvider>
      <MemoApp />
    </AppContextProvider>
  </AuthContextProvider>
  //</StrictMode>
);
