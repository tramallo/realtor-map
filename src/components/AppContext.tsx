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
import { BackendApi } from "../utils/backendApiInterface";

type AppContext = {
  backendApi: BackendApi;
  notifyUser: (message: string) => void;
};

const appContext = createContext<AppContext | undefined>({
  backendApi: undefined as unknown as BackendApi,
  notifyUser: () => undefined,
});

export interface AppContenxtProviderProps {
  backendApi: BackendApi;
  children: ReactNode;
}

export function AppContextProvider({
  backendApi,
  children,
}: AppContenxtProviderProps) {
  const { userSession } = useAuthContext();

  const [currentMessage, setCurrentMessage] = useState("");

  const notifyUser = useCallback((message: string) => {
    setCurrentMessage(message);
  }, []);

  return (
    <appContext.Provider value={{ backendApi, notifyUser }}>
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
