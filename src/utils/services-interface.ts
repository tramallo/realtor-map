import { CreatePersonData, CreatePropertyData, CreateRealtorData, PersonData, PersonFilterData, PropertyData, PropertyFilterData, RealtorData, RealtorFilterData, UpdatePersonData, UpdatePropertyData, UpdateRealtorData } from "./domainSchemas";
import { OperationResponse } from "./helperFunctions";

export enum BackendEvent {
    Connect = "connect",
    Disconnect = "disconnect",
    NewProperty = "new-property",
    UpdatedProperty = "updated-property",
    DeletedProperty = "deleted-property",
    NewRealtor = "new-realtor",
    UpdatedRealtor = "updated-realtor",
    DeletedRealtor = "deleted-realtor",
    NewPerson = "new-person",
    UpdatedPerson = "updated-person",
    DeletedPerson = "deleted-person",
}
export interface BackendApi {
    //properties
    getProperties: (propertyIds: Array<PropertyData['id']>) => Promise<OperationResponse<Array<PropertyData>>>;
    searchPropertyIds: (filter: PropertyFilterData) => Promise<OperationResponse<Array<PropertyData['id']>>>;
    createProperty: (newPropertyData: CreatePropertyData) => Promise<OperationResponse>;
    updateProperty: (propertyId: PropertyData["id"], updateData: UpdatePropertyData) => Promise<OperationResponse>;
    deleteProperty: (propertyId: PropertyData['id']) => Promise<OperationResponse>;
    invalidateProperties: (propertyIds: Array<PropertyData["id"]>, timestamp: number) => Promise<OperationResponse<Array<PropertyData["id"]>>>
    propertiesSubscribe: (
        newPropertyHandler: (newProperty: PropertyData) => void,
        updatedPropertyHandler: (updatedProperty: PropertyData) => void,
        deletedPropertyHandler: (deletedProperty: PropertyData) => void,
    ) => Promise<OperationResponse>;
    propertiesUnsubscribe: () => void;
    //realtors
    getRealtors: (realtorIds: Array<RealtorData['id']>) => Promise<OperationResponse<Array<RealtorData>>>;
    searchRealtorIds: (filter: RealtorFilterData) => Promise<OperationResponse<Array<RealtorData['id']>>>;
    createRealtor: (newRealtorData: CreateRealtorData) => Promise<OperationResponse>;
    updateRealtor: (realtorId: RealtorData["id"], updateData: UpdateRealtorData) => Promise<OperationResponse>;
    deleteRealtor: (realtorId: RealtorData['id']) => Promise<OperationResponse>;
    invalidateRealtors: (realtorIds: Array<RealtorData["id"]>, timestamp: number) => Promise<OperationResponse<Array<RealtorData["id"]>>>;
    realtorsSubscribe: (
        newRealtorHandler: (newRealtor: RealtorData) => void,
        updatedRealtorHandler: (updatedRealtor: RealtorData) => void,
        deletedRealtorHandler: (deletedRealtor: RealtorData) => void,
    ) => Promise<OperationResponse>;
    realtorsUnsubscribe: () => void;
    //persons
    getPersons: (personIds: Array<PersonData['id']>) => Promise<OperationResponse<Array<PersonData>>>;
    searchPersonIds: (filter: PersonFilterData) => Promise<OperationResponse<Array<PersonData['id']>>>;
    createPerson: (newPersonData: CreatePersonData) => Promise<OperationResponse>;
    updatePerson: (personId: PersonData["id"], updateData: UpdatePersonData) => Promise<OperationResponse>;
    deletePerson: (personId: PersonData['id']) => Promise<OperationResponse>;
    invalidatePersons: (personIds: Array<PersonData["id"]>, timestamp: number) => Promise<OperationResponse<Array<PersonData["id"]>>>;
    personsSubscribe: (
        newPersonHandler: (newPerson: PersonData) => void,
        updatedPersonHandler: (updatedPerson: PersonData) => void,
        deletedPersonHandler: (deletedPerson: PersonData) => void,
    ) => Promise<OperationResponse>;
    personsUnsubscribe: () => void;
}

export type Location = {
    address: string;
    coordinates: { lat: number; lng: number };
}
export interface GeocodingService {
    searchAddress: (searchValue: string) => Promise<OperationResponse<Location[]>>;
    attribution: React.ReactElement
}

export interface MapTilesService {
    getMapTilesUrl: () => Promise<OperationResponse<string>>;
    attribution: string
}
