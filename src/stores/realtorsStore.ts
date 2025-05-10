import { create } from "zustand";

import { CreateRealtorDTO, Realtor, UpdateRealtorDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { RealtorFilter } from "../utils/data-filter-schema";
import { realtorCompliesFilter } from "../utils/filter-evaluators";

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
    realtors: Record<Realtor["id"], Realtor | undefined>;
    searchResults: Record<string, Array<Realtor["id"]> | undefined>;
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

    const storeSearchResult = (filter: string, result: Array<Realtor["id"]>) => {
        const { searchResults } = get();
        const searchResultsCopy = { ...searchResults };

        const storedFilterResults = searchResults[filter];
        if (storedFilterResults) {
            searchResultsCopy[filter] = [...storedFilterResults, ...result];
        } else {
            searchResultsCopy[filter] = result;
        }

        set({ searchResults: searchResultsCopy });
    };
    const removeSearchResult = (filter: string, result: Array<Realtor["id"]>) => {
        const { searchResults } = get();
        if (!searchResults[filter]) return;

        const searchResultsCopy = { ...searchResults };
        searchResultsCopy[filter] = searchResultsCopy[filter]!.filter(
            realtorId => !result.includes(realtorId)
        );
        set({ searchResults: searchResultsCopy });
    };

    const newRealtorHandler = (newRealtor: Realtor) => {
        console.log(`event -> [new-realtor] ${newRealtor.name} `);
        storeRealtors([newRealtor]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as RealtorFilter;
            if (realtorCompliesFilter(newRealtor, filter)) {
                storeSearchResult(filterAsString, [newRealtor.id]);
            }
        });
    };
    const updatedRealtorHandler = (updatedRealtor: Realtor) => {
        console.log(`event -> [updated-realtor] ${updatedRealtor.name} `);
        storeRealtors([updatedRealtor]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as RealtorFilter;
            if (searchResults[filterAsString]!.includes(updatedRealtor.id)) {
                if (!realtorCompliesFilter(updatedRealtor, filter)) {
                    removeSearchResult(filterAsString, [updatedRealtor.id]);
                }
            } else {
                if (realtorCompliesFilter(updatedRealtor, filter)) {
                    storeSearchResult(filterAsString, [updatedRealtor.id]);
                }
            }
        });
    };
    const deletedRealtorHandler = (deletedRealtor: Realtor) => {
        console.log(`event -> [deleted-realtor] ${deletedRealtor.name}`);
        removeRealtors([deletedRealtor.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            if (searchResults[filterAsString]!.includes(deletedRealtor.id)) {
                removeSearchResult(filterAsString, [deletedRealtor.id]);
            }
        });
    };
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
        searchResults: {},
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
            const filterAsString = JSON.stringify(filter);
            console.log(`realtorStore -> searchRealtors - filter: ${filterAsString}`);

            const { realtors, searchResults: storedSearchResults } = get();

            let searchResult = storedSearchResults[filterAsString];
            if (!searchResult) {
                const { error, data } = await backendApi.searchRealtorIds(filter);
                if (error) return { error };
                storeSearchResult(filterAsString, data);
                searchResult = data;
            }

            const storedRealtorIds = new Set(Object.keys(realtors).map(Number));
            const nonStoredRealtorIds = searchResult.filter(
                id => !storedRealtorIds.has(id)
            );

            if (nonStoredRealtorIds.length > 0) {
                const { error: getError, data: newRealtors } = 
                    await backendApi.getRealtors(nonStoredRealtorIds);
                if (getError) return { error: getError };
                storeRealtors(newRealtors);
            }

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
export const searchResultByStringFilter = (filter: string) => {
    return (store: RealtorStore) => store.searchResults[filter];
};