import { ReactNode, useCallback, useState } from "react";

import CustomSnackbar from "./CustomSnackbar";
import { LoginPane } from "./LoginPane";
import CustomModal from "./CustomModal";
import { appContext, useAuthContext } from "../utils/helperFunctions";

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
      {userSession && children}
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
