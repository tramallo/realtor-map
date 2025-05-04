import { ReactNode, useCallback, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import {
  getSession,
  logout,
  onAuthStateChange,
  signInWithPassword,
} from "../services/supabaseApi";
import { authContext, OperationResponse } from "../utils/helperFunctions";

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
