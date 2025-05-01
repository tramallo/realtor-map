import { create } from "zustand";
import { CreateRealtorData, RealtorData, RealtorFilterData, UpdateRealtorData } from "../utils/domainSchemas";
import { OperationResponse } from "../utils/helperFunctions";
import { createRealtor, deleteRealtor, getRealtors, invalidateRealtors, realtorsSubscribe, searchRealtorIds, updateRealtor, WsEvent } from "../utils/realtorMapService";

const REALTORS_LOCAL_STORAGE_KEY = "realtors-store";
const fetchLocalStorageRealtors = (): OperationResponse<Record<RealtorData["id"], RealtorData> | undefined> => {
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
    realtors: Record<RealtorData["id"], RealtorData>;
    fetchRealtor: (realtorId: RealtorData["id"]) => Promise<OperationResponse>;
    searchRealtors: (filter: RealtorFilterData) => Promise<OperationResponse>;
    createRealtor: (newRealtorData: CreateRealtorData) => Promise<OperationResponse>;
    updateRealtor: (realtorId: RealtorData['id'], updateData: UpdateRealtorData) => Promise<OperationResponse>;
    deleteRealtor: (realtorId: RealtorData['id']) => Promise<OperationResponse>;
}

export const useRealtorStore = create<RealtorStore>((set, get) => {
    console.log(`realtorsStore -> create`);

    const storeRealtors = (realtors: RealtorData[]) => {
        const { realtors: realtorsCache } = get();
        const cacheCopy = { ...realtorsCache };

        realtors.forEach((realtor) => {
            cacheCopy[realtor.id] = realtor;
        });
    
        set({ realtors: cacheCopy });
    };
    const removeRealtors = (realtorIds: Array<RealtorData['id']>) => {
            const { realtors: storedRealtors } = get();
            const storedRealtorsCopy = { ...storedRealtors };
            
            realtorIds.forEach((realtorId) => {
                delete storedRealtorsCopy[realtorId];
            })
    
            set({ realtors: storedRealtorsCopy });
    };

    const newRealtorHandler = (newRealtor: RealtorData) => {
        console.log(`event -> [${WsEvent.NewRealtor}] ${newRealtor.name} `);
        storeRealtors([newRealtor]);
    }
    const updatedRealtorHandler = (updatedRealtor: RealtorData) => {
        console.log(`event -> [${WsEvent.UpdatedRealtor}] ${updatedRealtor.name} `);
        storeRealtors([updatedRealtor]);
    }
    const deletedRealtorHandler = (deletedRealtor: RealtorData) => {
        console.log(`event -> [${WsEvent.DeletedRealtor}] ${deletedRealtor.name}`);
        removeRealtors([deletedRealtor.id]);
    }
    realtorsSubscribe(newRealtorHandler, updatedRealtorHandler, deletedRealtorHandler);

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
    
        const localStorageRealtorIds = Object.keys(localStorageRealtors) as unknown as Array<RealtorData["id"]>;
    
        if (localStorageRealtorIds.length == 0) {
            return;
        }
    
        const { data: validIds, error: invalidateRealtorsError } = await invalidateRealtors(localStorageRealtorIds, Date.now());
    
        if (invalidateRealtorsError) {
            console.error('realtorsStorage -> syncLocalStorageState -> error: ', invalidateRealtorsError);
            return;
        }
    
        const validRealtors: Record<RealtorData["id"], RealtorData> = {};
        validIds.forEach((validId) => {
            validRealtors[validId] = localStorageRealtors![validId];
        })
    
        set({ realtors: validRealtors });
    }
    syncLocalStorageState();

    return {
        realtors: {},
        fetchRealtor: async (realtorId: RealtorData["id"]) => {
            console.log(`realtorStore -> fetchRealtor - realtorId: ${realtorId}`)

            const { realtors: storedRealtors } = get();
            const storedRealtor = storedRealtors[realtorId];

            if (storedRealtor) {
                return { data: undefined };
            }

            const { data: realtors, error } = await getRealtors([realtorId]);

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
    
            const { error, data } = await searchRealtorIds(filter);
        
            if (error) {
                return { error };
            }
        
            const { realtors } = get();
            const storedRealtorIds = new Set(Object.keys(realtors).map(Number));
            const nonStoredRealtorIds = data.filter((realtorId) => !storedRealtorIds.has(realtorId));

            if (nonStoredRealtorIds.length == 0) {
                return { data: undefined };
            }

            const { error: getRealtorsError, data: nonStoredRealtors } = await getRealtors(nonStoredRealtorIds);
            
            if (getRealtorsError) {
                return { error: getRealtorsError };
            }
        
            storeRealtors(nonStoredRealtors);
            return { data: undefined };
        },
        createRealtor: async (newRealtorData) => {
            console.log(`realtorStore -> createRealtor - realtorData: ${JSON.stringify(newRealtorData)}`)

            const { error } = await createRealtor(newRealtorData);

            if (error) {
                return {error};
            }

            return { data: undefined };
        },
        updateRealtor: async (realtorId, updateData) => {
            console.log(`realtorStore -> updateRealtor - realtorId: ${realtorId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await updateRealtor(realtorId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteRealtor: async (realtorId) => {
            console.log(`realtorStore -> deleteRealtor realtorId: ${realtorId}`);
        
            const { error } = await deleteRealtor(realtorId);
        
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

export const fetchByIdSelector = (realtorId: RealtorData["id"]) => {
    return (store: RealtorStore) => store.realtors[realtorId];
}
