import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import {
  getSession,
  logout,
  onAuthStateChange,
  signInWithPassword,
} from "../services/supabaseApi";
import { OperationResponse } from "../utils/helperFunctions";

type AuthContext = {
  userSession: Session | undefined;
  startSession: (email: string, password: string) => Promise<OperationResponse>;
  endSession: () => Promise<OperationResponse>;
};

const authContext = createContext<AuthContext | undefined>({
  userSession: undefined,
  startSession: async () => ({ error: new Error("not implemented") }),
  endSession: async () => ({ error: new Error("not implemented") }),
});

export interface AuthContextProviderProps {
  children: ReactNode;
}

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [userSession, setUserSession] = useState(
    undefined as Session | undefined
  );

  const startSession = useCallback(
    async (email: string, password: string): Promise<OperationResponse> => {
      const { error } = await signInWithPassword(email, password);

      if (error) {
        return { error };
      }

      return { data: undefined };
    },
    []
  );

  const endSession = useCallback(async (): Promise<OperationResponse> => {
    const { error } = await logout();

    if (error) {
      return { error };
    }

    return { data: undefined };
  }, []);

  //loadSession effect
  useEffect(() => {
    getSession().then(({ data, error }) => {
      if (error) {
        return;
      }

      setUserSession(data);
    });

    const { data: subscription } = onAuthStateChange((_event, session) =>
      setUserSession(session ?? undefined)
    );

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <authContext.Provider value={{ userSession, startSession, endSession }}>
      {children}
    </authContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
}
