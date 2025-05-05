import { create } from "zustand";

import { CreateContractDTO, Contract, UpdateContractDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { ContractFilter } from "../utils/data-filter-schema";

export interface ContractStore {
    contracts: Record<Contract["id"], Contract>;
    fetchContract: (contractId: Contract["id"]) => Promise<OperationResponse>;
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

    const newContractHandler = (newContract: Contract) => {
        console.log(`event -> [new-contract] ${newContract.id} `);
        storeContracts([newContract]);
    }
    const updatedContractHandler = (updatedContract: Contract) => {
        console.log(`event -> [updated-contract] ${updatedContract.id} `);
        storeContracts([updatedContract]);
    }
    const deletedContractHandler = (deletedContract: Contract) => {
        console.log(`event -> [deleted-contract] ${deletedContract.id}`);
        removeContracts([deletedContract.id]);
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
        searchContracts: async (filter) => {
            console.log(`contractStore -> searchContracts - filter: ${JSON.stringify(filter)}`)

            const { error, data } = await backendApi.searchContractIds(filter);

            if (error) {
                return { error };
            }

            const { contracts } = get();
            const storedContractIds = new Set(Object.keys(contracts).map(Number));
            const nonStoredContractIds = data.filter((contractId) => !storedContractIds.has(contractId));

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