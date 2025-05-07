import { Session } from "@supabase/supabase-js";
import { format, isValid } from "date-fns";
import { createContext, useContext } from "react";

interface SuccessResponse<T> {
  data: T;
  error?: undefined;
}
interface ErrorResponse {
  data?: undefined;
  error: Error
}
export type OperationResponse<T = undefined> = SuccessResponse<T> | ErrorResponse

export const dateToTimestamp = (date: Date | null | undefined): number | undefined => {
  if (!date || !isValid(date)) {
    return undefined;
  }

  return Math.floor(date.getTime() / 1000);
}
export const timestampToDate = (timestamp: number | undefined): Date | null => {
  if (!timestamp) {
    return null;
  }

  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  if (!isValid(date)) {
    return null;
  }

  return date;
}
export const timestampToDDMMYYString = (timestamp: number): string | undefined => {
  const asDate = timestampToDate(timestamp);
  if (!asDate) {
    return undefined;
  }

  return format(asDate, "dd/MM/yy");
}

export const countDefinedAttributes = <T extends Record<string, unknown>>(object: T) => {
  return Object.keys(object).filter(key => object[key] !== undefined).length;
}

type AuthContext = {
  userSession: Session | undefined;
  startSession: (email: string, password: string) => Promise<OperationResponse>;
  endSession: () => Promise<OperationResponse>;
};
export const authContext = createContext<AuthContext | undefined>({
  userSession: undefined,
  startSession: async () => ({ error: new Error("not implemented") }),
  endSession: async () => ({ error: new Error("not implemented") }),
});
export function useAuthContext() {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
}

type AppContext = {
  notifyUser: (message: string) => void;
};
export const appContext = createContext<AppContext | undefined>({
  notifyUser: () => undefined,
});
export function useAppContext() {
  const context = useContext(appContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}