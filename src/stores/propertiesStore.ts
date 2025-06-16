import { create } from "zustand";
import { orderBy } from "lodash";

import { CreatePropertyDTO, Property, UpdatePropertyDTO } from "../utils/data-schema";
import { 
    DataStorage, 
    getLocalStorageData, 
    createSearchIndex, 
    OperationResponse, 
    SearchDataResult, 
    SearchDataResults, 
    SearchIndex,
    parseSearchIndex, 
} from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { SortConfig, PaginationCursor, PropertyFilter } from "../utils/data-filter-schema";
import { propertyCompliesFilter } from "../utils/filter-evaluators";

const PROPERTIES_LOCAL_STORAGE_KEY = "properties";

export interface PropertyStore {
    properties: DataStorage<Property>;
    searchResults: SearchDataResults<Property>;
    fetchProperty: (propertyId: Property["id"]) => Promise<OperationResponse>;
    fetchProperties: (propertyIds: Array<Property["id"]>) => Promise<OperationResponse>;
    searchProperties: (
        filter: PropertyFilter, 
        sortConfig: SortConfig<Property>, 
        recordsPerPage: number,
        paginationCursor?: PaginationCursor<Property>,
    ) => Promise<OperationResponse<SearchIndex>>;
    fetchSearchPropertiesCount: (searchReference: string) => Promise<OperationResponse>;
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

    const addPropertyIdsToSearchResult = (
        searchIndex: SearchIndex, 
        propertyIds: Array<Property["id"]>,
        paginationCursor?: PaginationCursor<Property>, 
    ) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = new Map(storedSearchResults)
        
        const storedSearchResult = storedSearchResultsCopy.get(searchIndex);
        if (!storedSearchResult) {
            storedSearchResultsCopy.set(searchIndex, { dataIds: propertyIds, loading: false });
            set({ searchResults: storedSearchResultsCopy });
            return;
        }

        const storedSearchResultCopy = { ...storedSearchResult };
        const paginationCursorIndex = storedSearchResultCopy.dataIds.findIndex(
            (propertyId) => propertyId == paginationCursor?.id
        );

        const notAlreadyPresentIds = propertyIds.filter(propertyId => !storedSearchResultCopy.dataIds.includes(propertyId));
        if (notAlreadyPresentIds.length == 0) {
            return;
        }

        storedSearchResultCopy.dataIds = [ 
            ...storedSearchResultCopy.dataIds.slice(0, paginationCursorIndex + 1), 
            ...notAlreadyPresentIds 
        ];

        storedSearchResultsCopy.set(searchIndex, storedSearchResultCopy);
        set({ searchResults: storedSearchResultsCopy });
    };
    const removePropertiesFromSearchResult = (searchIndex: SearchIndex, propertyIds: Array<Property["id"]>) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = new Map(storedSearchResults)

        const storedSearchResult = storedSearchResultsCopy.get(searchIndex);
        if (!storedSearchResult) {
            return;
        }

        storedSearchResult.dataIds = 
            storedSearchResult.dataIds.filter(searchResultId => !propertyIds.includes(searchResultId));
        set({ searchResults: storedSearchResultsCopy });
    };
    const setSearchResultTotalRows = (searchIndex: SearchIndex, totalRows: number | undefined) => {
        const { searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = new Map(storedSearchResults);

        const storedSearchResult = storedSearchResultsCopy.get(searchIndex);
        if (!storedSearchResult) {
            return;
        }

        storedSearchResultsCopy.set(searchIndex, { ...storedSearchResult, totalRows: totalRows })
        set({ searchResults: storedSearchResultsCopy });
    }
    const sortSearchResult = (searchIndex: SearchIndex) => {
        const { properties: storedProperties, searchResults: storedSearchResults } = get();
        const storedSearchResultsCopy = new Map(storedSearchResults);

        const storedSearchResult = storedSearchResultsCopy.get(searchIndex);
        if (!storedSearchResult) {
            return;
        }
        if (storedSearchResult.dataIds.length == 0) {
            return;
        }

        const properties = storedSearchResult.dataIds.map(resultId => {
            if (!storedProperties[resultId]) {
                console.warn(`propertyStore -> sortSearchResults -
                    warn: property (id: ${resultId}) is not present, cannot be sorted. will be set at final`)
            }
            return storedProperties[resultId];
        }).filter(property => property != undefined)
        const nonPresentPropertyIds = storedSearchResult.dataIds.filter(resultId => storedProperties[resultId] == undefined);

        const [, sortConfig] = parseSearchIndex(searchIndex) as [PropertyFilter, SortConfig<Property>];
        const sortColumns = sortConfig.map(sortEntry => sortEntry.column);
        const sortDirections = sortConfig.map(sortEntry => sortEntry.direction);
        const sortedProperties = orderBy(properties, sortColumns, sortDirections);
        const sortedIds = sortedProperties.map(property => property.id);

        storedSearchResult.dataIds = [...sortedIds, ...nonPresentPropertyIds];
        set({ searchResults: storedSearchResultsCopy });
    };

    const newPropertyHandler = (newProperty: Property) => {
        console.log(`event -> [new-property] ${newProperty.address} `);
        storeProperties([newProperty]);

        const { searchResults } = get();
        searchResults.forEach((_searchResult, searchIndex) => {
            const [filter] = parseSearchIndex(searchIndex) as [PropertyFilter];

            if (propertyCompliesFilter(newProperty, filter)) {
                addPropertyIdsToSearchResult(searchIndex, [newProperty.id]);
                sortSearchResult(searchIndex);
            }
        })
    };
    const updatedPropertyHandler = (updatedProperty: Property) => {
        console.log(`event -> [updated-property] ${updatedProperty.address} `);
        storeProperties([updatedProperty]);

        const { searchResults } = get();
        searchResults.forEach((searchResult, searchIndex) => {
            const [filter] = parseSearchIndex(searchIndex) as [PropertyFilter];

            if (searchResult.dataIds.includes(updatedProperty.id)) {
                if (!propertyCompliesFilter(updatedProperty, filter)) {
                    removePropertiesFromSearchResult(searchIndex, [updatedProperty.id]);
                }
            } else {
                if (propertyCompliesFilter(updatedProperty, filter)) {
                    addPropertyIdsToSearchResult(searchIndex, [updatedProperty.id]);
                }
            }
        })
    };
    const deletedPropertyHandler = (deletedProperty: Property) => {
        console.log(`event -> [deleted-property] ${deletedProperty.address}`);
        removeProperties([deletedProperty.id]);

        const { searchResults } = get();
        searchResults.forEach((searchResult, searchIndex) => {
            if (searchResult.dataIds.includes(deletedProperty.id)) {
                removePropertiesFromSearchResult(searchIndex, [deletedProperty.id]);
            }
        })
    };
    backendApi.propertiesSubscribe(newPropertyHandler, updatedPropertyHandler, deletedPropertyHandler);

    const syncLocalStorageState = async () => {
        console.log(`propertiesStorage -> syncLocalStorageState`);
    
        const { error, data: localStorageProperties} = getLocalStorageData<DataStorage<Property>>(PROPERTIES_LOCAL_STORAGE_KEY);
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
    
        const validProperties: DataStorage<Property> = {};
        validIds.forEach((validId) => {
            validProperties[validId] = localStorageProperties[validId];
        })
    
        set({ properties: validProperties });
    }
    syncLocalStorageState()
        .finally(() => setInitialized())

    return {
        properties: {},
        searchResults: new Map(),
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
            const searchIndex: SearchIndex = createSearchIndex(filter, sortConfig);
            const searchReference = `${searchIndex}<>${JSON.stringify(paginationCursor)}`;
            console.log(`propertyStore -> searchProperties - 
                searchIndex: ${searchIndex}
                recordsPerPage: ${recordsPerPage}
                paginationCursor: ${JSON.stringify(paginationCursor)}`
            );
            await initializedFlag;

            const { searchResults: storedSearchResults } = get();
            const storedSearchResult = storedSearchResults.get(searchIndex);
            if (storedSearchResult) {
                const paginationCursorIndex = storedSearchResult.dataIds.findIndex(
                    (propertyId) => propertyId == paginationCursor?.id
                )

                const resultsAlreadyStored = 
                    (paginationCursorIndex + recordsPerPage) < storedSearchResult.dataIds.length
                if (resultsAlreadyStored) {
                    console.log(`propertyStore -> searchProperties - use already stored result`);
                    return { data: searchReference };
                }
            }

            const { error, data: propertyIds } = 
                await backendApi.searchPropertyIds(filter, sortConfig, recordsPerPage, paginationCursor);
            if (error) return { error };
            if (!propertyIds) return { error: new Error(`searchProperties -> error: No data received`) };

            addPropertyIdsToSearchResult(searchIndex, propertyIds, paginationCursor);
            return { data: searchReference };
        },
        fetchSearchPropertiesCount: async (searchReference) => {
            console.log(`propertyStore -> fetchSearchPropertiesCount - searchReference: ${searchReference}`);
            await initializedFlag;

            const [searchIndex] = searchReference.split("<>");
            const [filter] = parseSearchIndex(searchIndex) as [PropertyFilter];
            const { error, data } = await backendApi.fetchPropertiesSearchCount(filter);
            if (error) {
                return { error };
            }
            if (!data) {
                return { error: new Error(`fetchSearchPropertiesCount -> error: No data received `) };
            }

            setSearchResultTotalRows(searchIndex, data);
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
});

export const selectPropertyById = (propertyId: Property["id"] | undefined) => {
    return (store: PropertyStore): Property | undefined => propertyId ? store.properties[propertyId] : undefined;
};
export const selectSearchResultBySearchReference = (searchReference: string | undefined)  => {
    return (store: PropertyStore): SearchDataResult<Property> | undefined => {
        const [searchIndex] = (searchReference ?? "").split("<>");

        return store.searchResults.get(searchIndex);
    }
};
