import { io, Socket } from "socket.io-client";

import { 
    CreatePersonData, 
    CreatePropertyData, 
    CreateRealtorData, 
    PersonData, 
    PersonFilterData, 
    PropertyData, 
    PropertyFilterData, 
    RealtorData, 
    RealtorFilterData, 
    UpdatePersonData, 
    UpdatePropertyData, 
    UpdateRealtorData 
} from "../utils/domainSchemas";
import { OperationResponse } from "../utils/helperFunctions";
import { BackendApi, BackendEvent } from "../utils/services-interface";

const realtorMapServiceUrl = import.meta.env.VITE_REALTOR_MAP_SERVICE_URL;

const propertiesConnection: Socket = io(`${realtorMapServiceUrl}/properties`, { autoConnect: false });
const realtorsConnection: Socket = io(`${realtorMapServiceUrl}/realtors`, { autoConnect: false });
const personsConnection: Socket = io(`${realtorMapServiceUrl}/persons`, { autoConnect: false });

const getProperties = async (propertyIds: Array<PropertyData['id']>): Promise<OperationResponse<Array<PropertyData>>> => {
    console.log(`realtorMapService -> getProperties - propertyIds: ${propertyIds}`);

    try {
        const query = `propertyIds=${propertyIds.join(',')}`;
        const requestUrl = `${realtorMapServiceUrl}/properties?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`getProperties -> error: ${response.status}`) }
        }

        const { properties } = await response.json() as { properties: Array<PropertyData> };
        return { data: properties };
    } catch (error) {
        return { error: new Error(`getProperties -> error: ${error}`) };
    }
}
const searchPropertyIds = async (filter: PropertyFilterData): Promise<OperationResponse<Array<PropertyData['id']>>> => {
    console.log(`realtorMapService -> searchPropertyIds - filter: ${JSON.stringify(filter)}`);

    try {
        const query = `filter=${encodeURIComponent(JSON.stringify(filter))}`;
        const requestUrl = `${realtorMapServiceUrl}/properties/search?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`searchPropertyIds -> error: ${response.status}`) };
        }

        const { propertyIds } = await response.json() as { propertyIds: Array<PropertyData['id']> };
        return { data: propertyIds };
    } catch (error) {
        return { error: new Error(`searchPropertyIds -> error: ${error}`) };
    }
}
const createProperty = async (newPropertyData: CreatePropertyData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> createProperty - propertyData: ${newPropertyData.address}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/properties`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(newPropertyData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`createProperty -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`createProperty -> error: ${error}`) };
    }
}
const updateProperty = async (propertyId: PropertyData["id"], updateData: UpdatePropertyData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> updateProperty - propertyId: ${propertyId} updateData: ${JSON.stringify(updateData)}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/properties/${propertyId}`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`updateProperty -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`updateProperty -> error: ${error}`) };
    }
}
const deleteProperty = async (propertyId: PropertyData['id']):Promise<OperationResponse> => {
    console.log(`realtorMapService -> deleteProperty propertyId: ${propertyId}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/properties/${propertyId}`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`deleteProperty -> error: ${response.status}`) };
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`deleteProperty -> error: ${error}`) };
    }
}
const invalidateProperties = async (propertyIds: Array<PropertyData["id"]>, timestamp: number): Promise<OperationResponse<Array<PropertyData["id"]>>> => {
    console.log(`realtorMapService -> invalidateProperties - propertyIds: ${propertyIds} timestamp: ${timestamp}`);

    try {
        const query = `propertyIds=${encodeURIComponent(propertyIds.join(','))}&timestamp=${timestamp}`;
        const requestUrl = `${realtorMapServiceUrl}/properties/invalidate?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`invalidateProperties -> error: ${response.status}`) };
        }

        const { validIds } = await response.json() as { validIds: Array<PropertyData["id"]> };
        return { data: validIds };
    } catch (error) {
        return error instanceof Error ? { error } : { error: new Error("Request error") };
    }
}

const getRealtors = async (realtorIds: Array<RealtorData['id']>): Promise<OperationResponse<Array<RealtorData>>> => {
    console.log(`realtorMapService -> getRealtors - realtorIds: ${realtorIds}`);

    try {
        const query = `realtorIds=${realtorIds.join(',')}`;
        const requestUrl = `${realtorMapServiceUrl}/realtors?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`getRealtors -> error: ${response.status}`) }
        }

        const { realtors } = await response.json() as { realtors: Array<RealtorData> };
        return { data: realtors };
    } catch (error) {
        return { error: new Error(`getRealtors -> error: ${error}`) };
    }
}
const searchRealtorIds = async (filter: RealtorFilterData): Promise<OperationResponse<Array<RealtorData['id']>>> => {
    console.log(`realtorMapService -> searchRealtorIds - filter: ${JSON.stringify(filter)}`);

    try {
        const query = `filter=${encodeURIComponent(JSON.stringify(filter))}`;
        const requestUrl = `${realtorMapServiceUrl}/realtors/search?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`searchRealtorIds -> error: ${response.status}`) };
        }

        const { realtorIds } = await response.json() as { realtorIds: Array<RealtorData['id']> };
        return { data: realtorIds };
    } catch (error) {
        return { error: new Error(`searchRealtorIds -> error: ${error}`) };
    }
}
const createRealtor = async (newRealtorData: CreateRealtorData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> createRealtor - realtorData: ${newRealtorData.name}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/realtors`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(newRealtorData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`createRealtor -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`createRealtor -> error: ${error}`) };
    }
}
const updateRealtor = async (realtorId: RealtorData["id"], updateData: UpdateRealtorData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> updateRealtor - realtorId: ${realtorId} updateData: ${JSON.stringify(updateData)}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/realtors/${realtorId}`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`updateRealtor -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`updateRealtor -> error: ${error}`) };
    }
}
const deleteRealtor = async (realtorId: RealtorData['id']):Promise<OperationResponse> => {
    console.log(`realtorMapService -> deleteRealtor realtorId: ${realtorId}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/realtors/${realtorId}`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`deleteRealtor -> error: ${response.status}`) };
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`deleteRealtor -> error: ${error}`) };
    }
}
const invalidateRealtors = async (realtorIds: Array<RealtorData["id"]>, timestamp: number): Promise<OperationResponse<Array<RealtorData["id"]>>> => {
    console.log(`realtorMapService -> invalidateRealtors - realtorIds: ${realtorIds} timestamp: ${timestamp}`);

    try {
        const query = `realtorIds=${encodeURIComponent(realtorIds.join(','))}&timestamp=${timestamp}`;
        const requestUrl = `${realtorMapServiceUrl}/realtors/invalidate?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`invalidateRealtors -> error: ${response.status}`) };
        }

        const { validIds } = await response.json() as { validIds: Array<RealtorData["id"]> };
        return { data: validIds };
    } catch (error) {
        return error instanceof Error ? { error } : { error: new Error("Request error") };
    }
}

const getPersons = async (personIds: Array<PersonData['id']>): Promise<OperationResponse<Array<PersonData>>> => {
    console.log(`realtorMapService -> getPersons - personIds: ${personIds}`);

    try {
        const query = `personIds=${personIds.join(',')}`;
        const requestUrl = `${realtorMapServiceUrl}/persons?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`getPersons -> error: ${response.status}`) };
        }
        
        const { persons } = await response.json() as { persons: Array<PersonData> };
        return { data: persons };
    } catch (error) {
        return { error: new Error(`getPersons -> error: ${error}`) };
    }
}
const searchPersonIds = async (filter: PersonFilterData): Promise<OperationResponse<Array<PersonData['id']>>> => {
    console.log(`realtorMapService -> searchPersonIds - filter: ${JSON.stringify(filter)}`);

    try {
        const query = `filter=${encodeURIComponent(JSON.stringify(filter))}`;
        const requestUrl = `${realtorMapServiceUrl}/persons/search?${query}`;

        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`searchPersonIds -> error: ${response.status}`) }
        }

        const { personIds } = await response.json() as { personIds: Array<PersonData['id']> };
        return { data: personIds };
    } catch (error) {
        return { error: new Error(`searchPersonIds -> error: ${error}`) }
    }
}
const createPerson = async (newPersonData: CreatePersonData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> createPerson - personData: ${newPersonData.name}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/persons`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(newPersonData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`createPerson -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`createPerson -> error: ${error}`) };
    }
}
const updatePerson = async (personId: PersonData["id"], updateData: UpdatePersonData): Promise<OperationResponse> => {
    console.log(`realtorMapService -> updatePerson - personId: ${personId} updateData: ${JSON.stringify(updateData)}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/persons/${personId}`;

        const response = await fetch(requestUrl, { 
            method: "POST", 
            body: JSON.stringify(updateData),
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`updatePerson -> error: ${response.status}`) }
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`updatePerson -> error: ${error}`) }
    }
}
const deletePerson = async (personId: PersonData['id']):Promise<OperationResponse> => {
    console.log(`realtorMapService -> deletePerson personId: ${personId}`);

    try {
        const requestUrl = `${realtorMapServiceUrl}/persons/${personId}`;
        const response = await fetch(requestUrl, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            return { error: new Error(`deletePerson -> error: ${response.status}`) };
        }

        return { data: undefined };
    } catch (error) {
        return { error: new Error(`deletePerson -> error: ${error}`) };
    }
}
const invalidatePersons = async (personIds: Array<PersonData["id"]>, timestamp: number): Promise<OperationResponse<Array<PersonData["id"]>>> => {
    console.log(`realtorMapService -> invalidatePersons - personIds: ${personIds} timestamp: ${timestamp}`);

    try {
        const query = `personIds=${encodeURIComponent(personIds.join(','))}&timestamp=${timestamp}`;
        const requestUrl = `${realtorMapServiceUrl}/persons/invalidate?${query}`;
        
        const response = await fetch(requestUrl, { method: "GET" });

        if (!response.ok) {
            return { error: new Error(`invalidatePersons -> error: ${response.status}`) }
        }

        const { validIds } = await response.json() as { validIds: Array<PersonData["id"]> };
        return { data: validIds };
    } catch (error) {
        return { error: new Error(`invalidatePersons -> error: ${error}`) };
    }
}

const propertiesSubscribe = async (
    newPropertyHandler: (newProperty: PropertyData) => void,
    updatedPropertyHandler: (updatedProperty: PropertyData) => void,
    deletedPropertyHandler: (deletedProperty: PropertyData) => void,
) => {
    console.log(`realtorMapService -> propertiesSubscribe`);

    if(propertiesConnection.connected) {
        console.log(`realtorMapService -> already subscribed`);
        return { data: undefined };
    }

    propertiesConnection.on(BackendEvent.Connect, () => {
        console.log(`realtorMapService -> ws connected to /properties with id: ${propertiesConnection.id}`);
    })
    propertiesConnection.on(BackendEvent.Disconnect, () => {
        console.log(`realtorMapService -> ws id: ${propertiesConnection.id} disconnected from /properties`);
    })

    propertiesConnection.on(BackendEvent.NewProperty, newPropertyHandler);
    propertiesConnection.on(BackendEvent.UpdatedProperty, updatedPropertyHandler);
    propertiesConnection.on(BackendEvent.DeletedProperty, deletedPropertyHandler);
    propertiesConnection.connect();

    return { data: undefined };
}
const propertiesUnsubscribe = () => {
    console.log(`realtorMapService -> propertiesUnsubscribe`);

    if(!propertiesConnection.connected) {
        console.log(`realtorsMapService -> already non-subscribed`);
        return;
    }

    propertiesConnection.disconnect();
    propertiesConnection.removeAllListeners();
}

const realtorsSubscribe = async (
    newRealtorHandler: (newRealtor: RealtorData) => void,
    updatedRealtorHandler: (updatedRealtor: RealtorData) => void,
    deletedRealtorHandler: (deletedRealtor: RealtorData) => void,
) => {
    console.log(`realtorMapService -> realtorsSubscribe`);

    if(realtorsConnection.connected) {
        console.log(`realtorMapService -> already subscribed`);
        return { data: undefined };
    }

    realtorsConnection.on(BackendEvent.Connect, () => {
        console.log(`realtorMapService -> ws connected to /realtors with id: ${realtorsConnection.id}`);
    })
    realtorsConnection.on(BackendEvent.Disconnect, () => {
        console.log(`realtorMapService -> ws id: ${propertiesConnection.id} disconnected form /realtors`);
    })

    realtorsConnection.on(BackendEvent.NewRealtor, newRealtorHandler);
    realtorsConnection.on(BackendEvent.UpdatedRealtor, updatedRealtorHandler);
    realtorsConnection.on(BackendEvent.DeletedRealtor, deletedRealtorHandler);
    realtorsConnection.connect();

    return { data: undefined };
}
const realtorsUnsubscribe = () => {
    console.log(`realtorMapService -> realtorsUnsubscribe`);

    if(!realtorsConnection.connected) {
        console.log(`realtorsMapService -> already non-subscribed`);
        return;
    }

    realtorsConnection.disconnect();
    realtorsConnection.removeAllListeners();
}

const personsSubscribe = async (
    newPersonHandler: (newPerson: PersonData) => void,
    updatedPersonHandler: (updatedPerson: PersonData) => void,
    deletedPersonHandler: (deletedPerson: PersonData) => void,
) => {
    console.log(`realtorMapService -> personsSubscribe`);

    if(personsConnection.connected) {
        console.log(`realtorMapService -> already subscribed`);
        return { data: undefined };
    }

    personsConnection.on(BackendEvent.Connect, () => {
        console.log(`realtorMapService -> ws connected to /persons with id: ${personsConnection.id}`);
    })
    personsConnection.on(BackendEvent.Disconnect, () => {
        console.log(`realtorMapService -> ws id: ${personsConnection.id} disconnected from /persons`);
    })

    personsConnection.on(BackendEvent.NewPerson, newPersonHandler);
    personsConnection.on(BackendEvent.UpdatedPerson, updatedPersonHandler);
    personsConnection.on(BackendEvent.DeletedPerson, deletedPersonHandler);
    personsConnection.connect();

    return { data: undefined };
}
const personsUnsubscribe = () => {
    console.log(`realtorMapService -> personsUnsubscribe`);

    if(!personsConnection.connected) {
        console.log(`realtorsMapService -> already non-subscribed`);
        return;
    }

    personsConnection.disconnect();
    personsConnection.removeAllListeners();
}

export const realtorMapApi: BackendApi = {
    //property
    getProperties,
    searchPropertyIds,
    createProperty,
    updateProperty,
    deleteProperty,
    invalidateProperties,
    propertiesSubscribe,
    propertiesUnsubscribe,
    //person
    getPersons,
    searchPersonIds,
    createPerson,
    updatePerson,
    deletePerson,
    invalidatePersons,
    personsSubscribe,
    personsUnsubscribe,
    //realtor
    getRealtors,
    searchRealtorIds,
    createRealtor,
    updateRealtor,
    deleteRealtor,
    invalidateRealtors,
    realtorsSubscribe,
    realtorsUnsubscribe,
}