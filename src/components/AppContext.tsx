import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

import CustomSnackbar from "./CustomSnackbar";
import { LoginPane } from "./LoginPane";
import CustomModal from "./CustomModal";
import { useAuthContext } from "./AuthContext";

type AppContext = {
  notifyUser: (message: string) => void;
};

const appContext = createContext<AppContext | undefined>({
  notifyUser: () => undefined,
});

export interface AppContenxtProviderProps {
  children: ReactNode;
}

export function AppContextProvider({ children }: AppContenxtProviderProps) {
  const { userSession } = useAuthContext();

  const [currentMessage, setCurrentMessage] = useState("");

  const notifyUser = useCallback((message: string) => {
    setCurrentMessage(message);
  }, []);

  return (
    <appContext.Provider value={{ notifyUser }}>
      {children}
      <CustomSnackbar
        open={currentMessage != ""}
        onClose={() => setCurrentMessage("")}
        message={currentMessage}
      />
      <CustomModal title="Login" open={userSession == undefined}>
        <LoginPane />
      </CustomModal>
    </appContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(appContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
