import { create } from "zustand";

import { CreatePropertyData, PropertyData, PropertyFilterData, UpdatePropertyData } from "../utils/domainSchemas";
import { OperationResponse } from "../utils/helperFunctions";
import { supabaseApi as backendApi } from "../services/supabaseApi";
import { BackendEvent } from "../utils/services-interface";

export interface PropertyStore {
    properties: Record<PropertyData["id"], PropertyData>;
    fetchProperty: (propertyId: PropertyData["id"]) => Promise<OperationResponse>;
    searchProperties: (filter: PropertyFilterData) => Promise<OperationResponse>;
    createProperty: (newPropertyData: CreatePropertyData) => Promise<OperationResponse>;
    updateProperty: (propertyId: PropertyData['id'], updateData: UpdatePropertyData) => Promise<OperationResponse>;
    deleteProperty: (propertyId: PropertyData['id']) => Promise<OperationResponse>;
}

const PROPERTIES_LOCAL_STORAGE_KEY = "properties-store";
const fetchLocalStorageProperties = (): OperationResponse<Record<PropertyData["id"], PropertyData> | undefined> => {
    console.log(`propertiesStorage -> fetchLocalStorageProperties`);

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

    const storeProperties = (properties: PropertyData[]) => {
        const { properties: propertiesCache } = get();
        const cacheCopy = { ...propertiesCache };

        properties.forEach((property) => {
            cacheCopy[property.id] = property;
        });
    
        set({ properties: cacheCopy });
    };
    const removeProperties = (propertyIds: Array<PropertyData['id']>) => {
            const { properties: storedProperties } = get();
            const storedPropertiesCopy = { ...storedProperties };
            
            propertyIds.forEach((propertyId) => {
                delete storedPropertiesCopy[propertyId];
            })
    
            set({ properties: storedPropertiesCopy });
    };

    const newPropertyHandler = (newProperty: PropertyData) => {
        console.log(`event -> [${BackendEvent.NewProperty}] ${newProperty.address} `);
        storeProperties([newProperty]);
    }
    const updatedPropertyHandler = (updatedProperty: PropertyData) => {
        console.log(`event -> [${BackendEvent.UpdatedProperty}] ${updatedProperty.address} `);
        storeProperties([updatedProperty]);
    }
    const deletedPropertyHandler = (deletedProperty: PropertyData) => {
        console.log(`event -> [${BackendEvent.DeletedProperty}] ${deletedProperty.address}`);
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
    
        const localStoragePropertyIds = Object.keys(localStorageProperties!) as unknown as Array<PropertyData["id"]>;
    
        if (localStoragePropertyIds.length == 0) {
            return;
        }
    
        const { data: validIds, error: invalidatePropertiesError } = await backendApi.invalidateProperties(localStoragePropertyIds, Date.now());
    
        if (invalidatePropertiesError) {
            console.error('propertiesStorage -> syncLocalStorageState -> error: ', invalidatePropertiesError);
            return;
        }
    
        const validProperties: Record<PropertyData["id"], PropertyData> = {};
        validIds.forEach((validId) => {
            validProperties[validId] = localStorageProperties![validId];
        })
    
        set({ properties: validProperties });
    }
    syncLocalStorageState();

    return {
        properties: {},
        fetchProperty: async (propertyId: PropertyData["id"]) => {
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

export const fetchByIdSelector = (propertyId: PropertyData["id"]) => {
    return (store: PropertyStore) => store.properties[propertyId];
}

