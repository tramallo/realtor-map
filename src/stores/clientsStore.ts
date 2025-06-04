import { create } from "zustand";

import { CreateClientDTO, Client, UpdateClientDTO } from "../utils/data-schema";
import { getLocalStorageData, objectsToString, OperationResponse, stringToObjects } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { ClientFilter, PaginationCursor, SortConfig } from "../utils/data-filter-schema";
import { clientCompliesFilter } from "../utils/filter-evaluators";
import { orderBy } from "lodash";

const CLIENTS_LOCAL_STORAGE_KEY = "clients-store";
export type ClientsStorage = Record<Client["id"], Client | undefined>;
export type SearchClientsResults = Record<string, Array<Client["id"]>>

export interface ClientStore {
    clients: ClientsStorage;
    searchResults: SearchClientsResults;
    fetchClient: (clientId: Client["id"]) => Promise<OperationResponse>;
    fetchClients: (clientIds: Array<Client["id"]>) => Promise<OperationResponse>;
    searchClients: (
        filter: ClientFilter,
        sortConfig: SortConfig<Client>, 
        recordsPerPage: number,
        paginationCursor?: PaginationCursor<Client>,
    ) => Promise<OperationResponse>;
    createClient: (newClientData: CreateClientDTO) => Promise<OperationResponse>;
    updateClient: (clientId: Client["id"], updateData: UpdateClientDTO) => Promise<OperationResponse>;
    deleteClient: (clientId: Client['id']) => Promise<OperationResponse>;
}

export const useClientStore = create<ClientStore>((set, get) => {
    console.log(`clientsStore -> create`);

    let setInitialized: () => void;
    const initializedFlag = new Promise<void>((resolve) => {
        setInitialized = resolve;
    });

    const storeClients = (clients: Client[]) => {
        const { clients: storedClients } = get();
        const storedClientsCopy = { ...storedClients };

        clients.forEach((client) => {
            storedClientsCopy[client.id] = client;
        });
    
        set({ clients: storedClientsCopy });
    }
    const removeClients = (clientIds: Array<Client['id']>) => {
        const { clients: storedClients } = get();
        const storedClientsCopy = { ...storedClients };
        
        clientIds.forEach((personId) => {
            delete storedClientsCopy[personId];
        })

        set({ clients: storedClientsCopy });
    }

    const storeSearchResult = (
        searchIndex: string, 
        paginationCursor: PaginationCursor<Client> | undefined, 
        newSearchResult: Array<Client["id"]>
    ) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            storedSearchResultsCopy[searchIndex] = newSearchResult;
            set({ searchResults: storedSearchResultsCopy });
            return;
        }

        const paginationCursorIndex = storedSearchResultsCopy[searchIndex].findIndex(
            (clientId) => clientId == paginationCursor?.id
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
    const removeContractFromSearchResult = (searchIndex: string, contractId: Client["id"]) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            return;
        }
    
        storedSearchResultsCopy[searchIndex].filter(searchResultId => searchResultId != contractId);
        set({ searchResults: storedSearchResultsCopy });
    }
    const sortSearchResults = (searchIndex: string) => {
        const { clients: storedClients, searchResults: storedSearchResults } = get();
        if (!storedSearchResults[searchIndex]) {
            return;
        }
        const storedSearchResultsCopy = { ...storedSearchResults };

        const [, sortConfig] = stringToObjects<[ClientFilter, SortConfig<Client>]>(searchIndex);
            
        const unsortedClientIds = storedSearchResultsCopy[searchIndex];
        if (unsortedClientIds.length == 0) {
            return;
        }

        const unsortedClients = unsortedClientIds.map(resultId => {
            if (!storedClients[resultId]) {
                console.warn(`clientStore -> sortSearchResults -
                    warn: client (id: ${resultId}) is not present, cannot be sorted. will be set at final`)
            }
            return storedClients[resultId];
        }).filter(client => client != undefined)
        const notFoundClientIds = unsortedClientIds.filter(resultId => storedClients[resultId] == undefined);

        const sortColumns = sortConfig.map(sortEntry => sortEntry.column);
        const sortDirections = sortConfig.map(sortEntry => sortEntry.direction);
        const sortedClients = orderBy(unsortedClients, sortColumns, sortDirections);
        const sortedResults = sortedClients.map(client => client.id);

        storedSearchResultsCopy[searchIndex] = [...sortedResults, ...notFoundClientIds];
        set({ searchResults: storedSearchResultsCopy });
    };

    const newClientHandler = (newClient: Client) => {
        console.log(`event -> [new-client] ${newClient.name} `);
        storeClients([newClient]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = stringToObjects<[ClientFilter]>(searchIndex);
    
            if (clientCompliesFilter(newClient, filter)) {
                const prevResults = searchResults[searchIndex];
                storeSearchResult(searchIndex, undefined, [...prevResults, newClient.id]);
                sortSearchResults(searchIndex);
            }
        });
    }
    const updatedClientHandler = (updatedClient: Client) => {
        console.log(`event -> [updated-client] ${updatedClient.name} `);
        storeClients([updatedClient]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = stringToObjects<[ClientFilter]>(searchIndex);
                    
            if (searchResults[searchIndex]!.includes(updatedClient.id)) {
                if (!clientCompliesFilter(updatedClient, filter)) {
                    removeContractFromSearchResult(searchIndex, updatedClient.id)
                }
            } else {
                if (clientCompliesFilter(updatedClient, filter)) {
                    const prevResults = searchResults[searchIndex];
                    storeSearchResult(searchIndex, undefined, [...prevResults, updatedClient.id]);
                }
            }
        });
    }
    const deletedClientHandler = (deletedClient: Client) => {
        console.log(`event -> [deleted-client] ${deletedClient.name}`);
        removeClients([deletedClient.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            if (searchResults[searchIndex]!.includes(deletedClient.id)) {
                removeContractFromSearchResult(searchIndex, deletedClient.id);
            }
        });
    }
    backendApi.clientsSubscribe(newClientHandler, updatedClientHandler, deletedClientHandler);

    const syncLocalStorageState = async () => {
        console.log(`clientsStore -> syncLocalStorageState`);

        const { error, data: localStorageClients} = getLocalStorageData<ClientsStorage>(CLIENTS_LOCAL_STORAGE_KEY);
        if (error) {
            console.log('clientsStore -> syncLocalStorageState -> error: ', error);
            localStorage.removeItem(CLIENTS_LOCAL_STORAGE_KEY);
            return;
        }
        if (!localStorageClients) {
            return;
        }

        const localStorageClientIds = Object.keys(localStorageClients) as unknown as Array<Client["id"]>;
        if (localStorageClientIds.length == 0) {
            return;
        }

        const { data: validIds, error: invalidateClientsError } = 
            await backendApi.invalidateClients(localStorageClientIds, Date.now());
        if (invalidateClientsError) {
            console.error('clientsStore -> syncLocalStorageState -> error: ', invalidateClientsError);
            return;
        }

        const validClients: ClientsStorage = {};
        validIds.forEach((validId) => {
            validClients[validId] = localStorageClients![validId];
        })

        set({ clients: validClients });
    }
    syncLocalStorageState()
        .finally(() => setInitialized());

    return {
        clients: {},
        searchResults: {},
        fetchClient: async (clientId: Client["id"]) => {
            console.log(`clientsStore -> fetchClient - clientId: ${clientId}`);
            await initializedFlag;

            const { clients: storedClients } = get();
            if (storedClients[clientId]) {
                return { data: undefined };
            }

            const { data: clients, error } = await backendApi.getClients([clientId]);
            if (error) {
                return { error };
            }

            if (clients) {
                storeClients(clients);
            }
            return { data: undefined };
        },
        fetchClients: async (clientIds) => {
          console.log(`clientsStore -> fetchClients - 
            clientIds: ${clientIds}`);
          await initializedFlag;

          const { clients: storedClients } = get();

          const nonStoredClientIds = clientIds.filter((clientId) => storedClients[clientId] == undefined);
          if (nonStoredClientIds.length == 0) {
            return { data: undefined };
          }

          const { data: clients, error } = await backendApi.getClients(clientIds);
          if (error) {
            return { error };
          }

          if (clients) {
            storeClients(clients);
          }
          return { data: undefined };
        },
        searchClients: async (filter, sortConfig, recordsPerPage, paginationCursor) => {
            const searchIndex = objectsToString(filter, sortConfig);
            console.log(`clientsStore -> searchClients - 
                searchIndex: ${searchIndex}
                recordsPerPage: ${recordsPerPage}
                paginationCursor: ${JSON.stringify(paginationCursor)}`);
            await initializedFlag;

            const { searchResults: storedSearchResults } = get();
            if (storedSearchResults[searchIndex]) {
                const paginationCursorIndex = storedSearchResults[searchIndex].findIndex(
                    (clientId) => clientId == paginationCursor?.id
                )

                const resultsAlreadyStored = (paginationCursorIndex + recordsPerPage) < storedSearchResults[searchIndex].length
                if (resultsAlreadyStored) {
                    console.log(`clientStore -> searchContracts - use already stored result`);
                    return { data: undefined };
                }
            }

            const { error, data: clientIds } = 
                await backendApi.searchClientIds(filter, sortConfig, recordsPerPage, paginationCursor);
            if (error) return { error };
            if (!clientIds) return { error: new Error(`searchClients -> error: No data received`) };

            storeSearchResult(searchIndex, paginationCursor, clientIds);
            return { data: undefined };
        },
        createClient: async (newClientData) => {
            console.log(`clientsStore -> createClient - 
                clientData: ${JSON.stringify(newClientData)}`);
            await initializedFlag;

            const { error } = await backendApi.createClient(newClientData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateClient: async (clientId, updateData) => {
            console.log(`clientsStore -> updateClient - 
                clientId: ${clientId} 
                updateData: ${JSON.stringify(updateData)}`);
            await initializedFlag;

            const { error } = await backendApi.updateClient(clientId, updateData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteClient: async (clientId) => {
            console.log(`clientsStore -> deleteClient clientId: ${clientId}`);
            await initializedFlag;

            const { error } = await backendApi.deleteClient(clientId);
            if (error) {
                return { error };
            }

            return { data: undefined };
        }
    };
})

useClientStore.subscribe((state) => {
    localStorage.setItem(CLIENTS_LOCAL_STORAGE_KEY, JSON.stringify(state.clients));
})

export const selectClientById = (clientId: Client["id"] | undefined) => {
    return (store: ClientStore): Client | undefined => clientId ? store.clients[clientId] : undefined;
}
export const selectSearchResultsBySearchIndex = (searchIndex: string) => {
    return (store: ClientStore): Array<Client["id"]> | undefined => store.searchResults[searchIndex];
}
