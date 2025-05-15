import { create } from "zustand";

import { CreateContractDTO, Contract, UpdateContractDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { ContractFilter } from "../utils/data-filter-schema";
import { contractCompliesFilter } from "../utils/filter-evaluators";

export interface ContractStore {
    contracts: Record<Contract["id"], Contract | undefined>;
    searchResults: Record<string, Array<Contract["id"]> | undefined>;
    fetchContract: (contractId: Contract["id"]) => Promise<OperationResponse>;
    fetchContracts: (contractIds: Array<Contract["id"]>) => Promise<OperationResponse>;
    searchContracts: (filter: ContractFilter) => Promise<OperationResponse>;
    createContract: (newContractData: CreateContractDTO) => Promise<OperationResponse>;
    updateContract: (contractId: Contract["id"], updateData: UpdateContractDTO) => Promise<OperationResponse>;
    deleteContract: (contractId: Contract['id']) => Promise<OperationResponse>;
}

const CONTRACTS_LOCAL_STORAGE_KEY = "contracts-store";
const fetchLocalStorageContracts = (): OperationResponse<Record<Contract["id"], Contract> | undefined> => {
    console.log(`contractsStore -> fetchLocalStorageContracts`);

    const rawLocalStorageData = localStorage.getItem(CONTRACTS_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStorageContracts -> error: ${error}`) };
    }
}

export const useContractStore = create<ContractStore>((set, get) => {
    console.log(`contractsStore -> create`);

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

    const storeSearchResult = (filter: string, result: Array<Contract["id"]>) => {
        const { searchResults } = get();
        const searchResultsCopy = { ...searchResults };

        const storedFilterResults = searchResults[filter];
        if (storedFilterResults) {
            //TODO: result may contain already present ids, filter those
            searchResultsCopy[filter] = [...storedFilterResults, ...result];
        } else {
            searchResultsCopy[filter] = result;
        }

        set({ searchResults: searchResultsCopy });
    }
    const removeSearchResult = (filter: string, result: Array<Contract["id"]>) => {
        const { searchResults } = get();
        if (!searchResults[filter]) {
            return;
        }

        const searchResultsCopy = { ...searchResults };

        searchResultsCopy[filter] = searchResultsCopy[filter]!.filter((contractId) => !result.includes(contractId));
        set({ searchResults: searchResultsCopy });
    }

    const newContractHandler = (newContract: Contract) => {
        console.log(`event -> [new-contract] ${newContract.id} `);
        storeContracts([newContract]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as ContractFilter;
            if (contractCompliesFilter(newContract, filter)) {
                storeSearchResult(filterAsString, [newContract.id]);
            }
        })
    }
    const updatedContractHandler = (updatedContract: Contract) => {
        console.log(`event -> [updated-contract] ${updatedContract.id} `);
        storeContracts([updatedContract]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as ContractFilter;
            if(searchResults[filterAsString]!.includes(updatedContract.id)) {
                if (!contractCompliesFilter(updatedContract, filter)) {
                    removeSearchResult(filterAsString, [updatedContract.id]);
                }
            } else {
                if (contractCompliesFilter(updatedContract, filter)) {
                    storeSearchResult(filterAsString, [updatedContract.id]);
                }
            }
        })
    }
    const deletedContractHandler = (deletedContract: Contract) => {
        console.log(`event -> [deleted-contract] ${deletedContract.id}`);
        removeContracts([deletedContract.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            if (searchResults[filterAsString]!.includes(deletedContract.id)) {
                removeSearchResult(filterAsString, [deletedContract.id]);
            }
        })
    }
    backendApi.contractsSubscribe(newContractHandler, updatedContractHandler, deletedContractHandler);

    const syncLocalStorageState = async () => {
        console.log(`contractsStorage -> syncLocalStorageState`);

        const { error, data: localStorageContracts} = fetchLocalStorageContracts();
        
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

        const { data: validIds, error: invalidateContractsError } = await backendApi.invalidateContracts(localStorageContractIds, Date.now());

        if (invalidateContractsError) {
            console.error('contractsStorage -> syncLocalStorageState -> error: ', invalidateContractsError);
            return;
        }

        const validContracts: Record<Contract["id"], Contract> = {};
        validIds.forEach((validId) => {
            validContracts[validId] = localStorageContracts![validId];
        })

        set({ contracts: validContracts });
    }
    syncLocalStorageState();

    return {
        contracts: {},
        searchResults: {},
        fetchContract: async (contractId) => {
            console.log(`contractStore -> fetchContract - contractId: ${contractId}`)

            const { contracts: storedContracts } = get();
            const storedContract = storedContracts[contractId];

            if (storedContract) {
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
        searchContracts: async (filter) => {
            const filterAsString = JSON.stringify(filter)
            console.log(`contractStore -> searchContracts - filter: ${filterAsString}`)

            const { contracts, searchResults: storedSearchResults } = get();

            let searchResult = storedSearchResults[filterAsString];
            if (!searchResult) {
                const { error, data } = await backendApi.searchContractIds(filter);
                if (error) {
                    return { error };
                }   
                storeSearchResult(filterAsString, data);
                searchResult = data;
            }

            const storedContractIds = new Set(Object.keys(contracts).map(Number));
            const nonStoredContractIds = searchResult.filter((contractId) => !storedContractIds.has(contractId));

            if (nonStoredContractIds.length === 0) {
                return { data: undefined };
            }

            const { error: getContractsError, data: nonStoredContracts } = await backendApi.getContracts(nonStoredContractIds);
            if (getContractsError) {
                return { error: getContractsError };
            }
            storeContracts(nonStoredContracts);

            return { data: undefined };
        },
        createContract: async (newContractData) => {
            console.log(`contractStore -> createContract - contractData: ${JSON.stringify(newContractData)}`)

            const { error } = await backendApi.createContract(newContractData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateContract: async (contractId, updateData) => {
            console.log(`contractStore -> updateContract - contractId: ${contractId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await backendApi.updateContract(contractId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteContract: async (contractId) => {
            console.log(`contractStore -> deleteContract contractId: ${contractId}`);

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

export const fetchByIdSelector = (contractId: Contract["id"]) => {
    return (store: ContractStore) => store.contracts[contractId];
}
export const searchResultByStringFilter = (filter: string) => {
    return (store: ContractStore) => store.searchResults[filter];
}
