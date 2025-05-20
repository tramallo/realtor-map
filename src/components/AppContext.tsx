import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { useTranslation } from "react-i18next";

import CustomSnackbar from "./CustomSnackbar";
import { LoginPane } from "./LoginPane";
import CustomModal from "./CustomModal";
import { useAuthContext } from "./AuthContext";
import { SupportedLanguage, supportedLocales } from "../translations";

type AppContext = {
  notifyUser: (message: string) => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const appContext = createContext<AppContext | undefined>({
  notifyUser: () => undefined,
});

export interface AppContenxtProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContenxtProviderProps) {
  const { i18n } = useTranslation();
  const locale = supportedLocales[i18n.language as SupportedLanguage];
  const { userSession } = useAuthContext();

  const [currentMessage, setCurrentMessage] = useState("");

  const [theme] = useState(createTheme());

  const notifyUser = useCallback((message: string) => {
    setCurrentMessage(message);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <appContext.Provider value={{ notifyUser }}>
          {userSession && children}
          <CustomSnackbar
            open={currentMessage != ""}
            onClose={() => setCurrentMessage("")}
            message={currentMessage}
          />
          <CustomModal
            title="Login"
            open={userSession == undefined}
            slideDirection="down"
          >
            <LoginPane />
          </CustomModal>
        </appContext.Provider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(appContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
