import {
  AuthChangeEvent,
  createClient,
  Session,
  Subscription,
} from "@supabase/supabase-js";

import { OperationResponse } from "../utils/helperFunctions";

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

const client = createClient(supabaseUrl, key);

// AUTH
export const getSession = async (): Promise<OperationResponse<Session>> => {
  const { data, error } = await client.auth.getSession();

  if (!data.session) {
    return { error: error ?? new Error("Session not found.") };
  }

  return { data: data.session };
};

export const onAuthStateChange = (
  callback: (event: AuthChangeEvent, session: Session | null) => void
): OperationResponse<Subscription> => {
  const { data } = client.auth.onAuthStateChange(callback);

  return { data: data.subscription };
};

export const signInWithPassword = async (
  email: string,
  password: string
): Promise<OperationResponse<Session>> => {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (!data.session) {
    return { error: error ?? new Error("No session") };
  }

  return { data: data.session };
};

export const logout = async (): Promise<OperationResponse> => {
  const { error } = await client.auth.signOut();

  if (error) {
    return { error };
  }

  return { data: undefined };
};
