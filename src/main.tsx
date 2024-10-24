import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import DomainDataProvider from "./components/DomainDataContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DomainDataProvider>
      <App />
    </DomainDataProvider>
  </StrictMode>
);
