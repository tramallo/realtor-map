import { create } from "zustand";

import { CreateRealtorDTO, Realtor, UpdateRealtorDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { BackendEvent } from "../utils/services-interface";
import { RealtorFilter } from "../utils/data-filter-schema";

const REALTORS_LOCAL_STORAGE_KEY = "realtors-store";
const fetchLocalStorageRealtors = (): OperationResponse<Record<Realtor["id"], Realtor> | undefined> => {
    console.log(`realtorsStore -> fetchLocalStorageRealtors`);

    const rawLocalStorageData = localStorage.getItem(REALTORS_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStorageRealtors -> error: ${error}`) };
    }
}

export interface RealtorStore {
    realtors: Record<Realtor["id"], Realtor>;
    fetchRealtor: (realtorId: Realtor["id"]) => Promise<OperationResponse>;
    searchRealtors: (filter: RealtorFilter) => Promise<OperationResponse>;
    createRealtor: (newRealtorData: CreateRealtorDTO) => Promise<OperationResponse>;
    updateRealtor: (realtorId: Realtor['id'], updateData: UpdateRealtorDTO) => Promise<OperationResponse>;
    deleteRealtor: (realtorId: Realtor['id']) => Promise<OperationResponse>;
}

export const useRealtorStore = create<RealtorStore>((set, get) => {
    console.log(`realtorsStore -> create`);

    const storeRealtors = (realtors: Realtor[]) => {
        const { realtors: realtorsCache } = get();
        const cacheCopy = { ...realtorsCache };

        realtors.forEach((realtor) => {
            cacheCopy[realtor.id] = realtor;
        });
    
        set({ realtors: cacheCopy });
    };
    const removeRealtors = (realtorIds: Array<Realtor['id']>) => {
            const { realtors: storedRealtors } = get();
            const storedRealtorsCopy = { ...storedRealtors };
            
            realtorIds.forEach((realtorId) => {
                delete storedRealtorsCopy[realtorId];
            })
    
            set({ realtors: storedRealtorsCopy });
    };

    const newRealtorHandler = (newRealtor: Realtor) => {
        console.log(`event -> [${BackendEvent.NewRealtor}] ${newRealtor.name} `);
        storeRealtors([newRealtor]);
    }
    const updatedRealtorHandler = (updatedRealtor: Realtor) => {
        console.log(`event -> [${BackendEvent.UpdatedRealtor}] ${updatedRealtor.name} `);
        storeRealtors([updatedRealtor]);
    }
    const deletedRealtorHandler = (deletedRealtor: Realtor) => {
        console.log(`event -> [${BackendEvent.DeletedRealtor}] ${deletedRealtor.name}`);
        removeRealtors([deletedRealtor.id]);
    }
    backendApi.realtorsSubscribe(newRealtorHandler, updatedRealtorHandler, deletedRealtorHandler);

    const syncLocalStorageState = async () => {
        console.log(`realtorsStorage -> syncLocalStorageState`);
    
        const { error, data: localStorageRealtors} = fetchLocalStorageRealtors();
            
        if (error) {
            console.log('realtorsStorage -> syncLocalStorageState -> error: ', error);
            localStorage.removeItem(REALTORS_LOCAL_STORAGE_KEY);
            return;
        }

        if (!localStorageRealtors) {
            return;
        }
    
        const localStorageRealtorIds = Object.keys(localStorageRealtors) as unknown as Array<Realtor["id"]>;
    
        if (localStorageRealtorIds.length == 0) {
            return;
        }
    
        const { data: validIds, error: invalidateRealtorsError } = await backendApi.invalidateRealtors(localStorageRealtorIds, Date.now());
    
        if (invalidateRealtorsError) {
            console.error('realtorsStorage -> syncLocalStorageState -> error: ', invalidateRealtorsError);
            return;
        }
    
        const validRealtors: Record<Realtor["id"], Realtor> = {};
        validIds.forEach((validId) => {
            validRealtors[validId] = localStorageRealtors![validId];
        })
    
        set({ realtors: validRealtors });
    }
    syncLocalStorageState();

    return {
        realtors: {},
        fetchRealtor: async (realtorId: Realtor["id"]) => {
            console.log(`realtorStore -> fetchRealtor - realtorId: ${realtorId}`)

            const { realtors: storedRealtors } = get();
            const storedRealtor = storedRealtors[realtorId];

            if (storedRealtor) {
                return { data: undefined };
            }

            const { data: realtors, error } = await backendApi.getRealtors([realtorId]);

            if (error) {
                return { error };
            }

            if (realtors) {
                storeRealtors(realtors);
            }

            return { data: undefined };
        },
        searchRealtors: async (filter) => {
            console.log(`realtorStore -> searchRealtors - filter: ${JSON.stringify(filter)}`)
    
            const { error, data } = await backendApi.searchRealtorIds(filter);
        
            if (error) {
                return { error };
            }
        
            const { realtors } = get();
            const storedRealtorIds = new Set(Object.keys(realtors).map(Number));
            const nonStoredRealtorIds = data.filter((realtorId) => !storedRealtorIds.has(realtorId));

            if (nonStoredRealtorIds.length == 0) {
                return { data: undefined };
            }

            const { error: getRealtorsError, data: nonStoredRealtors } = await backendApi.getRealtors(nonStoredRealtorIds);
            
            if (getRealtorsError) {
                return { error: getRealtorsError };
            }
        
            storeRealtors(nonStoredRealtors);
            return { data: undefined };
        },
        createRealtor: async (newRealtorData) => {
            console.log(`realtorStore -> createRealtor - realtorData: ${JSON.stringify(newRealtorData)}`)

            const { error } = await backendApi.createRealtor(newRealtorData);

            if (error) {
                return {error};
            }

            return { data: undefined };
        },
        updateRealtor: async (realtorId, updateData) => {
            console.log(`realtorStore -> updateRealtor - realtorId: ${realtorId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await backendApi.updateRealtor(realtorId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteRealtor: async (realtorId) => {
            console.log(`realtorStore -> deleteRealtor realtorId: ${realtorId}`);
        
            const { error } = await backendApi.deleteRealtor(realtorId);
        
            if (error) {
                return { error };
            }
    
            return { data: undefined };
        }
    };
})

useRealtorStore.subscribe((state) => {
    localStorage.setItem(REALTORS_LOCAL_STORAGE_KEY, JSON.stringify(state.realtors));
})

export const fetchByIdSelector = (realtorId: Realtor["id"]) => {
    return (store: RealtorStore) => store.realtors[realtorId];
}
