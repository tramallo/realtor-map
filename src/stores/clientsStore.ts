import { create } from "zustand";

import { CreateClientDTO, Client, UpdateClientDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { ClientFilter } from "../utils/data-filter-schema";
import { clientCompliesFilter } from "../utils/filter-evaluators";

export interface ClientStore {
    clients: Record<Client["id"], Client | undefined>;
    searchResults: Record<string, Array<Client["id"]> | undefined>;
    fetchClient: (clientId: Client["id"]) => Promise<OperationResponse>;
    fetchClients: (clientIds: Array<Client["id"]>) => Promise<OperationResponse>;
    searchClients: (filter: ClientFilter) => Promise<OperationResponse>;
    createClient: (newClientData: CreateClientDTO) => Promise<OperationResponse>;
    updateClient: (clientId: Client["id"], updateData: UpdateClientDTO) => Promise<OperationResponse>;
    deleteClient: (clientId: Client['id']) => Promise<OperationResponse>;
}

const CLIENTS_LOCAL_STORAGE_KEY = "clients-store";
const fetchLocalStorageClients = (): OperationResponse<Record<Client["id"], Client> | undefined> => {
    console.log(`clientsStore -> fetchLocalStorageClients`);

    const rawLocalStorageData = localStorage.getItem(CLIENTS_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStorageClients -> error: ${error}`) };
    }
}

export const useClientStore = create<ClientStore>((set, get) => {
    console.log(`clientsStore -> create`);

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

    const storeSearchResult = (filter: string, result: Array<Client["id"]>) => {
        const { searchResults } = get();
        const searchResultsCopy = { ...searchResults };

        const storedFilterResults = searchResults[filter];
        if (storedFilterResults) {
            searchResultsCopy[filter] = [...storedFilterResults, ...result];
        } else {
            searchResultsCopy[filter] = result;
        }

        set({ searchResults: searchResultsCopy });
    }
    const removeSearchResult = (filter: string, result: Array<Client["id"]>) => {
        const { searchResults } = get();
        if (!searchResults[filter]) return;

        const searchResultsCopy = { ...searchResults };
        searchResultsCopy[filter] = searchResultsCopy[filter]!.filter(
            clientid => !result.includes(clientid)
        );
        set({ searchResults: searchResultsCopy });
    }

    const newClientHandler = (newClient: Client) => {
        console.log(`event -> [new-client] ${newClient.name} `);
        storeClients([newClient]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as ClientFilter;
            if (clientCompliesFilter(newClient, filter)) {
                storeSearchResult(filterAsString, [newClient.id]);
            }
        })
    }
    const updatedClientHandler = (updatedClient: Client) => {
        console.log(`event -> [updated-client] ${updatedClient.name} `);
        storeClients([updatedClient]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            const filter = JSON.parse(filterAsString) as ClientFilter;
            if (searchResults[filterAsString]!.includes(updatedClient.id)) {
                if (!clientCompliesFilter(updatedClient, filter)) {
                    removeSearchResult(filterAsString, [updatedClient.id]);
                }
            } else {
                if (clientCompliesFilter(updatedClient, filter)) {
                    storeSearchResult(filterAsString, [updatedClient.id]);
                }
            }
        })
    }
    const deletedClientHandler = (deletedClient: Client) => {
        console.log(`event -> [deleted-client] ${deletedClient.name}`);
        removeClients([deletedClient.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((filterAsString) => {
            if (searchResults[filterAsString]!.includes(deletedClient.id)) {
                removeSearchResult(filterAsString, [deletedClient.id]);
            }
        })
    }
    backendApi.clientsSubscribe(newClientHandler, updatedClientHandler, deletedClientHandler);

    const syncLocalStorageState = async () => {
        console.log(`clientsStore -> syncLocalStorageState`);

        const { error, data: localStorageClients} = fetchLocalStorageClients();
        
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

        const { data: validIds, error: invalidateClientsError } = await backendApi.invalidateClients(localStorageClientIds, Date.now());

        if (invalidateClientsError) {
            console.error('clientsStore -> syncLocalStorageState -> error: ', invalidateClientsError);
            return;
        }

        const validClients: Record<Client["id"], Client> = {};
        validIds.forEach((validId) => {
            validClients[validId] = localStorageClients![validId];
        })

        set({ clients: validClients });
    }
    syncLocalStorageState();

    return {
        clients: {},
        searchResults: {},
        fetchClient: async (clientId: Client["id"]) => {
            console.log(`clientsStore -> fetchClient - clientId: ${clientId}`)

            const { clients: storedClients } = get();
            const storedClient = storedClients[clientId];

            if (storedClient) {
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
          console.log(`clientsStore -> fetchClients - clientIds: ${clientIds}`);

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
        searchClients: async (filter) => {
            const filterAsString = JSON.stringify(filter);
            console.log(`clientsStore -> searchClients - filter: ${filterAsString}`)

            const { clients, searchResults: storedSearchResults } = get();

            let searchResult = storedSearchResults[filterAsString];
            if (!searchResult) {
                const { error, data } = await backendApi.searchClientIds(filter);
                if (error) return { error };
                storeSearchResult(filterAsString, data);
                searchResult = data;
            }

            const storedClientIds = new Set(Object.keys(clients).map(Number));
            const nonStoredClientIds = searchResult.filter(
                clientId => !storedClientIds.has(clientId)
            );

            if (nonStoredClientIds.length === 0) return { data: undefined };

            const { error: getClientsError, data: nonStoredClients } = await backendApi.getClients(nonStoredClientIds);
            if (getClientsError) return { error: getClientsError };

            storeClients(nonStoredClients);
            return { data: undefined };
        },
        createClient: async (newClientData) => {
            console.log(`clientsStore -> createClient - clientData: ${JSON.stringify(newClientData)}`)

            const { error } = await backendApi.createClient(newClientData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateClient: async (clientId, updateData) => {
            console.log(`clientsStore -> updateClient - clientId: ${clientId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await backendApi.updateClient(clientId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteClient: async (clientId) => {
            console.log(`clientsStore -> deleteClient clientId: ${clientId}`);

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

export const fetchByIdSelector = (clientId: Client["id"]) => {
    return (store: ClientStore) => store.clients[clientId];
}
export const searchResultByStringFilter = (filter: string) => {
    return (store: ClientStore) => store.searchResults[filter];
}
