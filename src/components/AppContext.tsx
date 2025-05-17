import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { createTheme, ThemeProvider } from "@mui/material";

import CustomSnackbar from "./CustomSnackbar";
import { LoginPane } from "./LoginPane";
import CustomModal from "./CustomModal";
import { useAuthContext } from "./AuthContext";

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
  const { userSession } = useAuthContext();

  const [currentMessage, setCurrentMessage] = useState("");

  const [theme, setTheme] = useState(createTheme());

  const notifyUser = useCallback((message: string) => {
    setCurrentMessage(message);
  }, []);

  return (
    <ThemeProvider theme={theme}>
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
