import { create } from "zustand";

import { CreatePropertyDTO, Property, UpdatePropertyDTO } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { PropertyFilter } from "../utils/data-filter-schema";

export interface PropertyStore {
    properties: Record<Property["id"], Property>;
    fetchProperty: (propertyId: Property["id"]) => Promise<OperationResponse>;
    searchProperties: (filter: PropertyFilter) => Promise<OperationResponse>;
    createProperty: (newPropertyData: CreatePropertyDTO) => Promise<OperationResponse>;
    updateProperty: (propertyId: Property['id'], updateData: UpdatePropertyDTO) => Promise<OperationResponse>;
    deleteProperty: (propertyId: Property['id']) => Promise<OperationResponse>;
}

const PROPERTIES_LOCAL_STORAGE_KEY = "properties-store";
const fetchLocalStorageProperties = (): OperationResponse<Record<Property["id"], Property> | undefined> => {
    console.log(`propertiesStore -> fetchLocalStorageProperties`);

    const rawLocalStorageData = localStorage.getItem(PROPERTIES_LOCAL_STORAGE_KEY);

    if (!rawLocalStorageData) {
        return { data: undefined };
    }

    try {
        const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
        return { data: parsedLocalStorageData };
    } catch (error) {
        return { error: new Error(`fetchLocalStorageProperties -> error: ${error}`) };
    }
}

export const usePropertyStore = create<PropertyStore>((set, get) => {
    console.log(`propertiesStore -> create`);

    const storeProperties = (properties: Property[]) => {
        const { properties: propertiesCache } = get();
        const cacheCopy = { ...propertiesCache };

        properties.forEach((property) => {
            cacheCopy[property.id] = property;
        });
    
        set({ properties: cacheCopy });
    };
    const removeProperties = (propertyIds: Array<Property['id']>) => {
            const { properties: storedProperties } = get();
            const storedPropertiesCopy = { ...storedProperties };
            
            propertyIds.forEach((propertyId) => {
                delete storedPropertiesCopy[propertyId];
            })
    
            set({ properties: storedPropertiesCopy });
    };

    const newPropertyHandler = (newProperty: Property) => {
        console.log(`event -> [new-property] ${newProperty.address} `);
        storeProperties([newProperty]);
    }
    const updatedPropertyHandler = (updatedProperty: Property) => {
        console.log(`event -> [updated-property] ${updatedProperty.address} `);
        storeProperties([updatedProperty]);
    }
    const deletedPropertyHandler = (deletedProperty: Property) => {
        console.log(`event -> [deleted-property] ${deletedProperty.address}`);
        removeProperties([deletedProperty.id]);
    }
    backendApi.propertiesSubscribe(newPropertyHandler, updatedPropertyHandler, deletedPropertyHandler);

    const syncLocalStorageState = async () => {
        console.log(`propertiesStorage -> syncLocalStorageState`);
    
        const { error, data: localStorageProperties} = fetchLocalStorageProperties();
            
        if (error) {
            console.log('propertiesStorage -> syncLocalStorageState -> error: ', error);
            localStorage.removeItem(PROPERTIES_LOCAL_STORAGE_KEY);
            return;
        }

        if (!localStorageProperties) {
            return;
        }
    
        const localStoragePropertyIds = Object.keys(localStorageProperties!) as unknown as Array<Property["id"]>;
    
        if (localStoragePropertyIds.length == 0) {
            return;
        }
    
        const { data: validIds, error: invalidatePropertiesError } = await backendApi.invalidateProperties(localStoragePropertyIds, Date.now());
    
        if (invalidatePropertiesError) {
            console.error('propertiesStorage -> syncLocalStorageState -> error: ', invalidatePropertiesError);
            return;
        }
    
        const validProperties: Record<Property["id"], Property> = {};
        validIds.forEach((validId) => {
            validProperties[validId] = localStorageProperties![validId];
        })
    
        set({ properties: validProperties });
    }
    syncLocalStorageState();

    return {
        properties: {},
        fetchProperty: async (propertyId: Property["id"]) => {
            console.log(`propertyStore -> fetchProperty - propertyId: ${propertyId}`)

            const { properties: storedProperties } = get();
            const storedProperty = storedProperties[propertyId];

            if (storedProperty) {
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
        searchProperties: async (filter) => {
            console.log(`propertyStore -> searchProperties - filter: ${JSON.stringify(filter)}`)
    
            const { error, data } = await backendApi.searchPropertyIds(filter);
        
            if (error) {
                return { error };
            }

            const { properties } = get();
            const storedPropertyIds = new Set(Object.keys(properties).map(Number));
            const nonStoredPropertyIds = data.filter((propertyId) => !storedPropertyIds.has(propertyId));
        
            if (nonStoredPropertyIds.length == 0) {
                return { data: undefined };
            }

            const { error: getPropertiesError, data: nonStoredProperties } = await backendApi.getProperties(nonStoredPropertyIds);
        
            if (getPropertiesError) {
                return { error: getPropertiesError };
            }
        
            storeProperties(nonStoredProperties);
            return { data: undefined };
        },
        createProperty: async (newPropertyData) => {
            console.log(`propertyStore -> createProperty - propertyData: ${JSON.stringify(newPropertyData)}`)

            const { error } = await backendApi.createProperty(newPropertyData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        updateProperty: async (propertyId, updateData) => {
            console.log(`propertyStore -> updateProperty - propertyId: ${propertyId} updateData: ${JSON.stringify(updateData)}`)

            const { error } = await backendApi.updateProperty(propertyId, updateData);

            if (error) {
                return { error };
            }

            return { data: undefined };
        },
        deleteProperty: async (propertyId) => {
            console.log(`propertyStore -> deleteProperty propertyId: ${propertyId}`);
        
            const { error } = await backendApi.deleteProperty(propertyId);
        
            if (error) {
                return { error };
            }
    
            return { data: undefined };
        }
    };
})

usePropertyStore.subscribe((state) => {
    localStorage.setItem(PROPERTIES_LOCAL_STORAGE_KEY, JSON.stringify(state.properties));
})

export const fetchByIdSelector = (propertyId: Property["id"]) => {
    return (store: PropertyStore) => store.properties[propertyId];
}

