import { create } from "zustand";

import { CreateContractDTO, Contract, UpdateContractDTO } from "../utils/data-schema";
import { getLocalStorageData, createSearchIndex, OperationResponse, parseSearchIndex } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { ContractFilter, PaginationCursor, SortConfig } from "../utils/data-filter-schema";
import { contractCompliesFilter } from "../utils/filter-evaluators";
import { orderBy } from "lodash";

const CONTRACTS_LOCAL_STORAGE_KEY = "contracts-store";
export type ContractsStorage = Record<Contract["id"], Contract | undefined>
export type SearchContractsResults = Record<string, Array<Contract["id"]>>;

export interface ContractStore {
    contracts: ContractsStorage;
    searchResults: SearchContractsResults;
    fetchContract: (contractId: Contract["id"]) => Promise<OperationResponse>;
    fetchContracts: (contractIds: Array<Contract["id"]>) => Promise<OperationResponse>;
    searchContracts: (
        filter: ContractFilter,
        sortConfig: SortConfig<Contract>, 
        recordsPerPage: number,
        paginationCursor?: PaginationCursor<Contract>,
    ) => Promise<OperationResponse>;
    createContract: (newContractData: CreateContractDTO) => Promise<OperationResponse>;
    updateContract: (contractId: Contract["id"], updateData: UpdateContractDTO) => Promise<OperationResponse>;
    deleteContract: (contractId: Contract['id']) => Promise<OperationResponse>;
}

export const useContractStore = create<ContractStore>((set, get) => {
    console.log(`contractsStore -> create`);

    let setInitialized: () => void;
    const initializedFlag = new Promise<void>((resolve) => {
        setInitialized = resolve;
    });

    const storeContracts = (contracts: Contract[]) => {
        const { contracts: storedContracts } = get();
        const storedContractsCopy = { ...storedContracts };

        contracts.forEach((contract) => {
            storedContractsCopy[contract.id] = contract;
        });
    
        set({ contracts: storedContractsCopy });
    }
    const removeContracts = (contractIds: Array<Contract['id']>) => {
        const { contracts: storedContracts } = get();
        const storedContractsCopy = { ...storedContracts };
        
        contractIds.forEach((contractId) => {
            delete storedContractsCopy[contractId];
        })

        set({ contracts: storedContractsCopy });
    }

    const storeSearchResult = (
        searchIndex: string, 
        paginationCursor: PaginationCursor<Contract> | undefined, 
        newSearchResult: Array<Contract["id"]>
    ) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            storedSearchResultsCopy[searchIndex] = newSearchResult;
            set({ searchResults: storedSearchResultsCopy });
            return;
        }

        const paginationCursorIndex = storedSearchResultsCopy[searchIndex].findIndex(
            (contractId) => contractId == paginationCursor?.id
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
    const removeContractFromSearchResult = (searchIndex: string, contractId: Contract["id"]) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            return;
        }
    
        storedSearchResultsCopy[searchIndex].filter(searchResultId => searchResultId != contractId);
        set({ searchResults: storedSearchResultsCopy });
    }
    const sortSearchResults = (searchIndex: string) => {
        const { contracts: storedContracts, searchResults: storedSearchResults } = get();
        if (!storedSearchResults[searchIndex]) {
            return;
        }
        const storedSearchResultsCopy = { ...storedSearchResults };

        const [, sortConfig] = parseSearchIndex<[ContractFilter, SortConfig<Contract>]>(searchIndex);
            
        const currentResults = storedSearchResultsCopy[searchIndex];
        if (currentResults.length == 0) {
            return;
        }

        const contracts = currentResults.map(resultId => {
            if (!storedContracts[resultId]) {
                console.warn(`contractStore -> sortSearchResults -
                    warn: contract (id: ${resultId}) is not present, cannot be sorted. will be set at final`)
            }
            return storedContracts[resultId];
        }).filter(contract => contract != undefined)
        const nonPresentContractIds = currentResults.filter(resultId => storedContracts[resultId] == undefined);

        const sortColumns = sortConfig.map(sortEntry => sortEntry.column);
        const sortDirections = sortConfig.map(sortEntry => sortEntry.direction);
        const sortedContracts = orderBy(contracts, sortColumns, sortDirections);
        const sortedResults = sortedContracts.map(realtor => realtor.id);

        storedSearchResultsCopy[searchIndex] = [...sortedResults, ...nonPresentContractIds];
        set({ searchResults: storedSearchResultsCopy });
    };

    const newContractHandler = (newContract: Contract) => {
        console.log(`event -> [new-contract] ${newContract.id} `);
        storeContracts([newContract]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = parseSearchIndex<[ContractFilter]>(searchIndex);
    
            if (contractCompliesFilter(newContract, filter)) {
                const prevResults = searchResults[searchIndex];
                storeSearchResult(searchIndex, undefined, [...prevResults, newContract.id]);
                sortSearchResults(searchIndex);
            }
        });
    }
    const updatedContractHandler = (updatedContract: Contract) => {
        console.log(`event -> [updated-contract] ${updatedContract.id} `);
        storeContracts([updatedContract]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = parseSearchIndex<[ContractFilter]>(searchIndex);
                    
            if (searchResults[searchIndex]!.includes(updatedContract.id)) {
                if (!contractCompliesFilter(updatedContract, filter)) {
                    removeContractFromSearchResult(searchIndex, updatedContract.id)
                }
            } else {
                if (contractCompliesFilter(updatedContract, filter)) {
                    const prevResults = searchResults[searchIndex];
                    storeSearchResult(searchIndex, undefined, [...prevResults, updatedContract.id]);
                }
            }
        });
    }
    const deletedContractHandler = (deletedContract: Contract) => {
        console.log(`event -> [deleted-contract] ${deletedContract.id}`);
        removeContracts([deletedContract.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            if (searchResults[searchIndex]!.includes(deletedContract.id)) {
                removeContractFromSearchResult(searchIndex, deletedContract.id);
            }
        });
    }
    backendApi.contractsSubscribe(newContractHandler, updatedContractHandler, deletedContractHandler);

    const syncLocalStorageState = async () => {
        console.log(`contractsStorage -> syncLocalStorageState`);

        const { error, data: localStorageContracts} = getLocalStorageData<ContractsStorage>(CONTRACTS_LOCAL_STORAGE_KEY);
        if (error) {
            console.log('contractsStorage -> syncLocalStorageState -> error: ', error);
            localStorage.removeItem(CONTRACTS_LOCAL_STORAGE_KEY);
            return;
        }
        if (!localStorageContracts) {
            return;
        }

        const localStorageContractIds = Object.keys(localStorageContracts) as unknown as Array<Contract["id"]>;
        if (localStorageContractIds.length === 0) {
            return;
        }

        const { data: validIds, error: invalidateContractsError } = 
            await backendApi.invalidateContracts(localStorageContractIds, Date.now());
        if (invalidateContractsError) {
            console.error('contractsStorage -> syncLocalStorageState -> error: ', invalidateContractsError);
            return;
        }

        const validContracts: ContractsStorage = {};
        validIds.forEach((validId) => {
            validContracts[validId] = localStorageContracts[validId];
        })

        set({ contracts: validContracts });
    }
    syncLocalStorageState()
        .finally(() => setInitialized());

    return {
        contracts: {},
        searchResults: {},
        fetchContract: async (contractId) => {
            console.log(`contractStore -> fetchContract - 
                contractId: ${contractId}`)
            await initializedFlag;

            const { contracts: storedContracts } = get();
            if (storedContracts[contractId]) {
                return { data: undefined };
            }

            const { data: contracts, error } = await backendApi.getContracts([contractId]);
            if (error) {
                return { error };
            }

            if (contracts) {
                storeContracts(contracts);
            }
            return { data: undefined };
        },
        fetchContracts: async (contractIds) => {
            console.log(`contractStore -> fetchContracts - contractIds: ${contractIds}`);
            await initializedFlag;

          const { contracts: storedContracts } = get();

          const nonStoredContracts = contractIds.filter((contractId) => storedContracts[contractId] == undefined);
          if (nonStoredContracts.length == 0) {
            return { data: undefined };
          }

          const { data: contracts, error } = await backendApi.getContracts(contractIds);
          if (error) {
            return { error };
          }

          if (contracts) {
            storeContracts(contracts);
          }
          return { data: undefined };
        },
        searchContracts: async (filter, sortConfig, recordsPerPage, paginationCursor) => {
            const searchIndex = createSearchIndex(filter, sortConfig);
            console.log(`contractStore -> searchContracts - 
                searchIndex: ${searchIndex}
                recordsPerPage: ${recordsPerPage}
                paginationCursor: ${JSON.stringify(paginationCursor)}`);
            await initializedFlag;

            const { searchResults: storedSearchResults } = get();
            if (storedSearchResults[searchIndex]) {
                const paginationCursorIndex = storedSearchResults[searchIndex].findIndex(
                    (contractId) => contractId == paginationCursor?.id
                )

                const resultsAlreadyStored = (paginationCursorIndex + recordsPerPage) < storedSearchResults[searchIndex].length
                if (resultsAlreadyStored) {
                    console.log(`contractStore -> searchContracts - use already stored result`);
                    return { data: undefined };
                }
            }

            const { error, data: contractIds } = 
                await backendApi.searchContractIds(filter, sortConfig, recordsPerPage, paginationCursor);
            if (error) return { error };
            if (!contractIds) return { error: new Error(`searchContracts -> error: No data received`) };

            storeSearchResult(searchIndex, paginationCursor, contractIds);
            return { data: undefined };
        },
        createContract: async (newContractData) => {
            console.log(`contractStore -> createContract - 
                contractData: ${JSON.stringify(newContractData)}`);
            await initializedFlag;

            const { error } = await backendApi.createContract(newContractData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateContract: async (contractId, updateData) => {
            console.log(`contractStore -> updateContract - 
                contractId: ${contractId} 
                updateData: ${JSON.stringify(updateData)}`);
            await initializedFlag;

            const { error } = await backendApi.updateContract(contractId, updateData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteContract: async (contractId) => {
            console.log(`contractStore -> deleteContract - 
                contractId: ${contractId}`);
            await initializedFlag;

            const { error } = await backendApi.deleteContract(contractId);
            if (error) {
                return { error };
            }

            return { data: undefined };
        }
    };
});

useContractStore.subscribe((state) => {
    localStorage.setItem(CONTRACTS_LOCAL_STORAGE_KEY, JSON.stringify(state.contracts));
});

export const selectContractById = (contractId: Contract["id"] | undefined) => {
    return (store: ContractStore): Contract | undefined => contractId ? store.contracts[contractId] : undefined;
}
export const selectSearchResultsBySearchIndex = (searchIndex: string) => {
    return (store: ContractStore): Array<Contract["id"]> | undefined => store.searchResults[searchIndex];
}
