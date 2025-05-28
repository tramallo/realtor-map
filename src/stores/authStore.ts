import { create } from "zustand";

import { OperationResponse } from "../utils/helperFunctions";
import { UpdateUserProfileDTO, UserProfile } from "../utils/data-schema";
import { supabaseAuth } from "../services/supabaseApi";
import { UserSession } from "../utils/services-interface";

export type UserProfileStorage = Record<UserProfile["id"], UserProfile>;

export interface AuthStore {
  userSession: UserSession | undefined;
  userProfiles: UserProfileStorage;
  startSession: (email: string, password: string) => Promise<OperationResponse>;
  endSession: () => Promise<OperationResponse>;
  fetchUserProfiles: (userIds: Array<UserProfile["id"]>) => Promise<OperationResponse>;
  updateUserProfile: (userId: UserProfile["id"], updateData: UpdateUserProfileDTO) => Promise<OperationResponse>;
}

const USER_PROFILES_LOCAL_STORAGE_KEY = "user-profiles";
const fetchLocalStorageUserProfiles = (): OperationResponse<UserProfileStorage | undefined> => {
    console.log(`authStore -> fetchLocalStorageUserProfiles`);

    const rawLocalStorageData = localStorage.getItem(USER_PROFILES_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStorageUserProfiles -> error: ${error}`) };
    }
}

export const useAuthStore = create<AuthStore>((set, get) => {

  const storeUserProfiles = (newUserProfiles: Array<UserProfile>) => {
    const { userProfiles } = get();
    const userProfilesCopy = { ...userProfiles };

    newUserProfiles.forEach(newUserProfile => {
      userProfilesCopy[newUserProfile.id] = newUserProfile;
    })

    set({ userProfiles: userProfilesCopy });
  }

  const removeUserProfiles = (userProfileIds: Array<UserProfile["id"]>) => {
    const { userProfiles } = get();
    const userProfilesCopy = { ...userProfiles };

    userProfileIds.forEach(userProfileId => {
      delete userProfilesCopy[userProfileId];
    })

    set({ userProfiles: userProfilesCopy });
  }

  const syncSessionFromLocalStorage = async () => {
    const { error, data: userSession } = await supabaseAuth.getUserSession();

    if (error) {
      console.log(`authStore -> syncLocalStorageSession - error: ${error}`);
      return;
    }

    if (!userSession) {
      return;
    }

    set({ userSession: userSession });
  }
  const syncUserProfilesFromLocalStorage = async () => {
    const { error, data: localStorageUserProfiles } = fetchLocalStorageUserProfiles();

    if (error) {
      console.log(`authStore -> syncLocalStorageUserProfiles - error: ${error}`);
      return;
    }

    if (!localStorageUserProfiles) {
      return;
    }

    //TODO: add invalidation request
    //TODO: store validated values
  }

  const initStore = async () => {
    console.log(`authStore -> initStore`);

    const { data: _subscription } = supabaseAuth.onAuthStateChange((newSession) => {
      set({ userSession: newSession });
    })
    //FIXME: unsubscribe

    await syncSessionFromLocalStorage();
    await syncUserProfilesFromLocalStorage();
  }
  initStore();

  return {
    userSession: undefined,
    userProfiles: {},
    startSession: async (email, password) => {
      console.log(`authStore -> startSession - email: ${email}`);

      const { error } = await supabaseAuth.startSession(email, password);

      if (error) {
        return { error };
      }

      return { data: undefined };
    },
    endSession: async () => {
      console.log(`authStore -> endSession`);

      const { error } = await supabaseAuth.endSession();

      if (error) {
        return { error };
      }

      return { data: undefined };
    },
    fetchUserProfiles: async (userIds) => {
      console.log(`authStore -> fetchUserProfiles - 
        userIds: ${userIds}`)

      const { error, data: userProfiles } = await supabaseAuth.fetchUserProfiles(userIds);

      if (error) {
        return { error };
      }

      storeUserProfiles(userProfiles);
      return { data: undefined };
    },
    updateUserProfile: async (userId, updateData) => {
      console.log(`authStore -> updateUserProfile -
        userId: ${userId}
        updateData: ${JSON.stringify(updateData)}`);

      //TODO: add supabaseAuth .updateUseraprofile() function

      return { data: undefined };
    },
  }
})
