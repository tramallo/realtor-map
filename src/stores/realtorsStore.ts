import { create } from "zustand";

import { CreateRealtorDTO, Realtor, UpdateRealtorDTO } from "../utils/data-schema";
import { getLocalStorageData, createSearchIndex, OperationResponse, parseSearchIndex } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { PaginationCursor, RealtorFilter, SortConfig } from "../utils/data-filter-schema";
import { realtorCompliesFilter } from "../utils/filter-evaluators";
import { orderBy } from "lodash";

const REALTORS_LOCAL_STORAGE_KEY = "realtors-store";
export type RealtorsStorage = Record<Realtor["id"], Realtor | undefined>
export type RealtorsSearch = Record<string, Array<Realtor["id"]>>;

export interface RealtorStore {
    realtors: RealtorsStorage;
    searchResults: RealtorsSearch;
    fetchRealtor: (realtorId: Realtor["id"]) => Promise<OperationResponse>;
    fetchRealtors: (realtorIds: Array<Realtor["id"]>) => Promise<OperationResponse>;
    searchRealtors: (
        filter: RealtorFilter,
        sortConfig: SortConfig<Realtor>, 
        recordsPerPage: number,
        paginationCursor?: PaginationCursor<Realtor>,
    ) => Promise<OperationResponse>;
    createRealtor: (newRealtorData: CreateRealtorDTO) => Promise<OperationResponse>;
    updateRealtor: (realtorId: Realtor['id'], updateData: UpdateRealtorDTO) => Promise<OperationResponse>;
    deleteRealtor: (realtorId: Realtor['id']) => Promise<OperationResponse>;
}

export const useRealtorStore = create<RealtorStore>((set, get) => {
    console.log(`realtorsStore -> create`);

    let setInitialized: () => void;
    const initializedFlag = new Promise<void>((resolve) => {
        setInitialized = resolve;
    });

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

    const storeSearchResult = (
        searchIndex: string, 
        paginationCursor: PaginationCursor<Realtor> | undefined, 
        newSearchResult: Array<Realtor["id"]>
    ) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            storedSearchResultsCopy[searchIndex] = newSearchResult;
            set({ searchResults: storedSearchResultsCopy });
            return;
        }

        const paginationCursorIndex = storedSearchResultsCopy[searchIndex].findIndex(
            (propertyId) => propertyId == paginationCursor?.id
        );

        storedSearchResultsCopy[searchIndex] = [ 
            ...storedSearchResultsCopy[searchIndex].slice(0, paginationCursorIndex + 1), 
            ...newSearchResult 
        ];

        set({ searchResults: storedSearchResultsCopy });
    };
    /* const removeSearchResult = (searchIndex: string) => {
        const { searchResults } = get();
        if (!searchResults[searchIndex]) return;

        const searchResultsCopy = { ...searchResults };
        delete searchResultsCopy[searchIndex];

        set({ searchResults: searchResultsCopy });
    }; */
    const removeRealtorFromSearchResult = (searchIndex: string, realtorId: Realtor["id"]) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            return;
        }
    
        storedSearchResultsCopy[searchIndex].filter(searchResultId => searchResultId != realtorId);
        set({ searchResults: storedSearchResultsCopy });
    }
    const sortSearchResults = (searchIndex: string) => {
        const { realtors: storedRealtors, searchResults: storedSearchResults } = get();
        if (!storedSearchResults[searchIndex]) {
            return;
        }
        const storedSearchResultsCopy = { ...storedSearchResults };
        
        const unsortedRealtorIds = storedSearchResultsCopy[searchIndex];
        if (unsortedRealtorIds.length == 0) {
            return;
        }

        const [, sortConfig] = parseSearchIndex<[RealtorFilter, SortConfig<Realtor>]>(searchIndex);

        const unsortedRealtors = unsortedRealtorIds.map(resultId => {
            if (!storedRealtors[resultId]) {
                console.warn(`realtorStore -> sortSearchResults -
                    warn: realtor (id: ${resultId}) is not present, cannot be sorted. will be set at final`)
            }
            return storedRealtors[resultId];
        }).filter(realtor => realtor != undefined)
        const nonPresentRealtorIds = unsortedRealtorIds.filter(resultId => storedRealtors[resultId] == undefined);

        const sortColumns = sortConfig.map(sortEntry => sortEntry.column);
        const sortDirections = sortConfig.map(sortEntry => sortEntry.direction);
        const sortedRealtors = orderBy(unsortedRealtors, sortColumns, sortDirections);
        const sortedRealtorIds = sortedRealtors.map(realtor => realtor.id);

        storedSearchResultsCopy[searchIndex] = [...sortedRealtorIds, ...nonPresentRealtorIds];
        set({ searchResults: storedSearchResultsCopy });
    };

    const newRealtorHandler = (newRealtor: Realtor) => {
        console.log(`event -> [new-realtor] ${newRealtor.name} `);
        storeRealtors([newRealtor]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = parseSearchIndex<[RealtorFilter]>(searchIndex);
    
            if (realtorCompliesFilter(newRealtor, filter)) {
                const prevResults = searchResults[searchIndex];
                storeSearchResult(searchIndex, undefined, [...prevResults, newRealtor.id]);
                sortSearchResults(searchIndex);
            }
        });
    };
    const updatedRealtorHandler = (updatedRealtor: Realtor) => {
        console.log(`event -> [updated-realtor] ${updatedRealtor.name} `);
        storeRealtors([updatedRealtor]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = parseSearchIndex<[RealtorFilter]>(searchIndex);
                    
            if (searchResults[searchIndex]!.includes(updatedRealtor.id)) {
                if (!realtorCompliesFilter(updatedRealtor, filter)) {
                    removeRealtorFromSearchResult(searchIndex, updatedRealtor.id)
                }
            } else {
                if (realtorCompliesFilter(updatedRealtor, filter)) {
                    const prevResults = searchResults[searchIndex];
                    storeSearchResult(searchIndex, undefined, [...prevResults, updatedRealtor.id]);
                }
            }
        });
    };
    const deletedRealtorHandler = (deletedRealtor: Realtor) => {
        console.log(`event -> [deleted-realtor] ${deletedRealtor.name}`);
        removeRealtors([deletedRealtor.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            if (searchResults[searchIndex]!.includes(deletedRealtor.id)) {
                removeRealtorFromSearchResult(searchIndex, deletedRealtor.id);
            }
        });
    };
    backendApi.realtorsSubscribe(newRealtorHandler, updatedRealtorHandler, deletedRealtorHandler);

    const syncLocalStorageState = async () => {
        console.log(`realtorsStorage -> syncLocalStorageState`);
    
        const { error, data: localStorageRealtors} = getLocalStorageData<RealtorsStorage>(REALTORS_LOCAL_STORAGE_KEY);
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
    
        const { data: validIds, error: invalidateRealtorsError } = 
            await backendApi.invalidateRealtors(localStorageRealtorIds, Date.now());
        if (invalidateRealtorsError) {
            console.error('realtorsStorage -> syncLocalStorageState -> error: ', invalidateRealtorsError);
            return;
        }
    
        const validRealtors: RealtorsStorage = {};
        validIds.forEach((validId) => {
            validRealtors[validId] = localStorageRealtors[validId];
        })
    
        set({ realtors: validRealtors });
    }
    syncLocalStorageState()
        .finally(() => setInitialized());

    return {
        realtors: {},
        searchResults: {},
        fetchRealtor: async (realtorId: Realtor["id"]) => {
            console.log(`realtorStore -> fetchRealtor - 
                realtorId: ${realtorId}`)
            await initializedFlag;

            const { realtors: storedRealtors } = get();
            if (storedRealtors[realtorId]) {
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
        fetchRealtors: async (realtorIds) => {
          console.log(`realtorStore -> fetchRealtors - realtorIds: ${realtorIds}`);
          await initializedFlag;

          const { realtors: storedRealtors } = get();

          const nonStoredRealtorIds = realtorIds.filter((realtorId) => storedRealtors[realtorId] == undefined);
          if (nonStoredRealtorIds.length == 0) {
            return { data: undefined };
          }

          const { data: realtors, error } = await backendApi.getRealtors(realtorIds);
          if (error) {
            return { error };
          }

          if (realtors) {
            storeRealtors(realtors);
          }
          return { data: undefined };
        },
        searchRealtors: async (filter, sortConfig, recordsPerPage, paginationCursor) => {
            const searchIndex = createSearchIndex(filter, sortConfig);
            console.log(`realtorStore -> searchRealtors - 
                searchIndex: ${searchIndex}
                recordsPerPage: ${recordsPerPage}
                paginationCursor: ${JSON.stringify(paginationCursor)}`);
            await initializedFlag;

            const { searchResults: storedSearchResults } = get();
            if (storedSearchResults[searchIndex]) {
                const paginationCursorIndex = storedSearchResults[searchIndex].findIndex(
                    (realtorId) => realtorId == paginationCursor?.id
                )

                const resultsAlreadyStored = (paginationCursorIndex + recordsPerPage) < storedSearchResults[searchIndex].length
                if (resultsAlreadyStored) {
                    console.log(`realtorStore -> searchRealtors - use already stored result`);
                    return { data: undefined };
                }
            }

            const { error, data: realtorIds } = 
                await backendApi.searchRealtorIds(filter, sortConfig, recordsPerPage, paginationCursor);
            if (error) return { error };
            if (!realtorIds) return { error: new Error(`searchRealtors -> error: No data received`) };

            storeSearchResult(searchIndex, paginationCursor, realtorIds);
            return { data: undefined };
        },
        createRealtor: async (newRealtorData) => {
            console.log(`realtorStore -> createRealtor - 
                realtorData: ${JSON.stringify(newRealtorData)}`)
            await initializedFlag;

            const { error } = await backendApi.createRealtor(newRealtorData);
            if (error) {
                return {error};
            }

            return { data: undefined };
        },
        updateRealtor: async (realtorId, updateData) => {
            console.log(`realtorStore -> updateRealtor - 
                realtorId: ${realtorId} 
                updateData: ${JSON.stringify(updateData)}`)
            await initializedFlag;

            const { error } = await backendApi.updateRealtor(realtorId, updateData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteRealtor: async (realtorId) => {
            console.log(`realtorStore -> deleteRealtor - 
                realtorId: ${realtorId}`);
            await initializedFlag;

            const { error } = await backendApi.deleteRealtor(realtorId);
            if (error) {
                return { error };
            }
    
            return { data: undefined };
        }
    };
})

useRealtorStore.subscribe((store) => {
    localStorage.setItem(REALTORS_LOCAL_STORAGE_KEY, JSON.stringify(store.realtors));
})

export const selectRealtorById = (realtorId: Realtor["id"] | undefined) => {
    return (store: RealtorStore): Realtor | undefined => realtorId ? store.realtors[realtorId] : undefined;
}
export const selectSearchResultsBySearchIndex = (searchIndex: string) => {
    return (store: RealtorStore): Array<Realtor["id"]> | undefined => store.searchResults[searchIndex];
};
