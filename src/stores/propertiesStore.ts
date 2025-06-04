import { create } from "zustand";

import { CreatePropertyDTO, Property, UpdatePropertyDTO } from "../utils/data-schema";
import { getLocalStorageData, objectsToString, OperationResponse, stringToObjects } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { SortConfig, PaginationCursor, PropertyFilter } from "../utils/data-filter-schema";
import { propertyCompliesFilter } from "../utils/filter-evaluators";
import { orderBy } from "lodash";

const PROPERTIES_LOCAL_STORAGE_KEY = "properties";
export type PropertiesStorage = Record<Property["id"], Property | undefined>;
export type SearchPropertiesResults = Record<string, Array<Property["id"]>>;

export interface PropertyStore {
    properties: PropertiesStorage;
    searchResults: SearchPropertiesResults;
    fetchProperty: (propertyId: Property["id"]) => Promise<OperationResponse>;
    fetchProperties: (propertyIds: Array<Property["id"]>) => Promise<OperationResponse>;
    searchProperties: (
        filter: PropertyFilter, 
        sortConfig: SortConfig<Property>, 
        recordsPerPage: number,
        paginationCursor?: PaginationCursor<Property>,
    ) => Promise<OperationResponse>;
    createProperty: (newPropertyData: CreatePropertyDTO) => Promise<OperationResponse>;
    updateProperty: (propertyId: Property['id'], updateData: UpdatePropertyDTO) => Promise<OperationResponse>;
    deleteProperty: (propertyId: Property['id']) => Promise<OperationResponse>;
}

export const usePropertyStore = create<PropertyStore>((set, get) => {
    console.log(`propertiesStore -> create`);
    
    let setInitialized: () => void;
    const initializedFlag = new Promise<void>((resolve) => {
        setInitialized = resolve;
    });

    const storeProperties = (newProperties: Property[]) => {
        const { properties: storedProperties } = get();
        const storedPropertiesCopy = { ...storedProperties };

        newProperties.forEach((property) => {
            storedPropertiesCopy[property.id] = property;
        });
    
        set({ properties: storedPropertiesCopy });
    };
    const removeProperties = (propertyIds: Array<Property['id']>) => {
        const { properties: storedProperties } = get();
        const storedPropertiesCopy = { ...storedProperties };
        
        propertyIds.forEach((propertyId) => {
            delete storedPropertiesCopy[propertyId];
        });

        set({ properties: storedPropertiesCopy });
    };

    const storeSearchResult = (
        searchIndex: string, 
        paginationCursor: PaginationCursor<Property> | undefined, 
        newSearchResult: Array<Property["id"]>
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
    const removePropertyFromSearchResult = (searchIndex: string, propertyId: Property["id"]) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = { ...storedSearchResults };

        if (!storedSearchResultsCopy[searchIndex]) {
            return;
        }

        storedSearchResultsCopy[searchIndex].filter(searchResultId => searchResultId != propertyId);
        set({ searchResults: storedSearchResultsCopy });
    }
    const sortSearchResults = (searchIndex: string) => {
        const { properties: storedProperties, searchResults: storedSearchResults } = get();
        if (!storedSearchResults[searchIndex]) {
            return;
        }
        const storedSearchResultsCopy = { ...storedSearchResults };

        const [, sortConfig] = stringToObjects<[PropertyFilter, SortConfig<Property>]>(searchIndex);
        
        const currentResults = storedSearchResultsCopy[searchIndex];
        if (currentResults.length == 0) {
            return;
        }

        const properties = currentResults.map(resultId => {
            if (!storedProperties[resultId]) {
                console.warn(`propertyStore -> sortSearchResults -
                    warn: property (id: ${resultId}) is not present, cannot be sorted. will be set at final`)
            }
            return storedProperties[resultId];
        }).filter(property => property != undefined)
        const nonPresentPropertyIds = currentResults.filter(resultId => storedProperties[resultId] == undefined);

        const sortColumns = sortConfig.map(sortEntry => sortEntry.column);
        const sortDirections = sortConfig.map(sortEntry => sortEntry.direction);
        const sortedProperties = orderBy(properties, sortColumns, sortDirections);
        const sortedResults = sortedProperties.map(property => property.id);

        storedSearchResultsCopy[searchIndex] = [...sortedResults, ...nonPresentPropertyIds];
        set({ searchResults: storedSearchResultsCopy });
    }

    const newPropertyHandler = (newProperty: Property) => {
        console.log(`event -> [new-property] ${newProperty.address} `);
        storeProperties([newProperty]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = stringToObjects<[PropertyFilter]>(searchIndex);

            if (propertyCompliesFilter(newProperty, filter)) {
                const prevResults = searchResults[searchIndex];
                storeSearchResult(searchIndex, undefined, [...prevResults, newProperty.id]);
                sortSearchResults(searchIndex);
            }
        });
    };
    const updatedPropertyHandler = (updatedProperty: Property) => {
        console.log(`event -> [updated-property] ${updatedProperty.address} `);
        storeProperties([updatedProperty]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            const [filter] = stringToObjects<[PropertyFilter]>(searchIndex);
            
            if (searchResults[searchIndex]!.includes(updatedProperty.id)) {
                if (!propertyCompliesFilter(updatedProperty, filter)) {
                    removePropertyFromSearchResult(searchIndex, updatedProperty.id)
                }
            } else {
                if (propertyCompliesFilter(updatedProperty, filter)) {
                    const prevResults = searchResults[searchIndex];
                    storeSearchResult(searchIndex, undefined, [...prevResults, updatedProperty.id]);
                }
            }
        });
    };
    const deletedPropertyHandler = (deletedProperty: Property) => {
        console.log(`event -> [deleted-property] ${deletedProperty.address}`);
        removeProperties([deletedProperty.id]);

        const { searchResults } = get();
        Object.keys(searchResults).forEach((searchIndex) => {
            if (searchResults[searchIndex]!.includes(deletedProperty.id)) {
                removePropertyFromSearchResult(searchIndex, deletedProperty.id);
            }
        });
    };
    backendApi.propertiesSubscribe(newPropertyHandler, updatedPropertyHandler, deletedPropertyHandler);

    const syncLocalStorageState = async () => {
        console.log(`propertiesStorage -> syncLocalStorageState`);
    
        const { error, data: localStorageProperties} = getLocalStorageData<PropertiesStorage>(PROPERTIES_LOCAL_STORAGE_KEY);
        if (error) {
            console.log('syncLocalStorageState -> error: ', error);
            localStorage.removeItem(PROPERTIES_LOCAL_STORAGE_KEY);
            return;
        }
        if (!localStorageProperties) {
            return;
        }
    
        const localStoragePropertyIds = Object.keys(localStorageProperties) as unknown as Array<Property["id"]>;
        if (localStoragePropertyIds.length == 0) {
            return;
        }
    
        const { data: validIds, error: invalidatePropertiesError } = 
            await backendApi.invalidateProperties(localStoragePropertyIds, Date.now());
        if (invalidatePropertiesError) {
            console.error('syncLocalStorageState -> error: ', invalidatePropertiesError);
            return;
        }
    
        const validProperties: PropertiesStorage = {};
        validIds.forEach((validId) => {
            validProperties[validId] = localStorageProperties[validId];
        })
    
        set({ properties: validProperties });
    }
    syncLocalStorageState()
        .finally(() => setInitialized())

    return {
        properties: {},
        searchResults: {},
        fetchProperty: async (propertyId: Property["id"]) => {
            console.log(`propertyStore -> fetchProperty - 
                propertyId: ${propertyId}`)
            await initializedFlag;
            
            const { properties: storedProperties } = get();
            if (storedProperties[propertyId]) {
                return { data: undefined };
            }

            const { data: properties, error } = await backendApi.getProperties([propertyId]);
            if (error) {
                return { error };
            }

            if (properties) {
                storeProperties(properties);
            }
            return { data: undefined };
        },
        fetchProperties: async (propertyIds) => {
            console.log(`propertyStore -> fetchProperties - propertyIds: ${propertyIds}`);
            await initializedFlag;

            const { properties: storedProperties } = get();

            const nonStoredProperties = propertyIds.filter((propertyId) => storedProperties[propertyId] == undefined);
            if (nonStoredProperties.length == 0) {
                return { data: undefined };
            }

            const { data: properties, error } = await backendApi.getProperties(propertyIds);
            if (error) {
                return { error };
            }

            if (properties) {
                storeProperties(properties);
            }
            return { data: undefined }
        },
        searchProperties: async (filter, sortConfig, recordsPerPage, paginationCursor) => {
            const searchIndex = objectsToString(filter, sortConfig);
            console.log(`propertyStore -> searchProperties - 
                searchIndex: ${searchIndex}
                recordsPerPage: ${recordsPerPage}
                paginationCursor: ${JSON.stringify(paginationCursor)}`
            );
            await initializedFlag;

            const { searchResults: storedSearchResults } = get();
            if (storedSearchResults[searchIndex]) {
                const paginationCursorIndex = storedSearchResults[searchIndex].findIndex(
                    (propertyId) => propertyId == paginationCursor?.id
                )

                const resultsAlreadyStored = (paginationCursorIndex + recordsPerPage) < storedSearchResults[searchIndex].length
                if (resultsAlreadyStored) {
                    console.log(`propertyStore -> searchProperties - use already stored result`);
                    return { data: undefined };
                }
            }

            const { error, data: propertyIds } = 
                await backendApi.searchPropertyIds(filter, sortConfig, recordsPerPage, paginationCursor);
            if (error) return { error };
            if (!propertyIds) return { error: new Error(`searchProperties -> error: No data received`) };

            storeSearchResult(searchIndex, paginationCursor, propertyIds);
            return { data: undefined };
        },
        createProperty: async (newPropertyData) => {
            console.log(`propertyStore -> createProperty - 
                propertyData: ${JSON.stringify(newPropertyData)}`)
            await initializedFlag;

            const { error } = await backendApi.createProperty(newPropertyData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateProperty: async (propertyId, updateData) => {
            console.log(`propertyStore -> updateProperty - 
                propertyId: ${propertyId} 
                updateData: ${JSON.stringify(updateData)}`)
            await initializedFlag;

            const { error } = await backendApi.updateProperty(propertyId, updateData);
            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteProperty: async (propertyId) => {
            console.log(`propertyStore -> deleteProperty - 
                propertyId: ${propertyId}`);
            await initializedFlag;

            const { error } = await backendApi.deleteProperty(propertyId);
            if (error) {
                return { error };
            }
    
            return { data: undefined };
        }
    };
})

usePropertyStore.subscribe((store) => {
    localStorage.setItem(PROPERTIES_LOCAL_STORAGE_KEY, JSON.stringify(store.properties));
})

export const selectPropertyById = (propertyId: Property["id"] | undefined) => {
    return (store: PropertyStore): Property | undefined => propertyId ? store.properties[propertyId] : undefined;
}
export const selectSearchResultsBySearchIndex = (searchIndex: string)  => {
    return (store: PropertyStore): Array<Property["id"]> | undefined => store.searchResults[searchIndex];
};
