import { PersonFilter, PropertyFilter, RealtorFilter } from "./data-filter-schema";
import { CreatePersonDTO, CreatePropertyDTO, CreateRealtorDTO, Person, Property, Realtor, UpdatePersonDTO, UpdatePropertyDTO, UpdateRealtorDTO } from "./data-schema";
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
    getProperties: (propertyIds: Array<Property['id']>) => Promise<OperationResponse<Array<Property>>>;
    searchPropertyIds: (filter: PropertyFilter) => Promise<OperationResponse<Array<Property['id']>>>;
    createProperty: (newPropertyData: CreatePropertyDTO) => Promise<OperationResponse>;
    updateProperty: (propertyId: Property["id"], updateData: UpdatePropertyDTO) => Promise<OperationResponse>;
    deleteProperty: (propertyId: Property['id']) => Promise<OperationResponse>;
    invalidateProperties: (propertyIds: Array<Property["id"]>, timestamp: number) => Promise<OperationResponse<Array<Property["id"]>>>
    propertiesSubscribe: (
        newPropertyHandler: (newProperty: Property) => void,
        updatedPropertyHandler: (updatedProperty: Property) => void,
        deletedPropertyHandler: (deletedProperty: Property) => void,
    ) => Promise<OperationResponse>;
    propertiesUnsubscribe: () => void;
    //realtors
    getRealtors: (realtorIds: Array<Realtor['id']>) => Promise<OperationResponse<Array<Realtor>>>;
    searchRealtorIds: (filter: RealtorFilter) => Promise<OperationResponse<Array<Realtor['id']>>>;
    createRealtor: (newRealtorData: CreateRealtorDTO) => Promise<OperationResponse>;
    updateRealtor: (realtorId: Realtor["id"], updateData: UpdateRealtorDTO) => Promise<OperationResponse>;
    deleteRealtor: (realtorId: Realtor['id']) => Promise<OperationResponse>;
    invalidateRealtors: (realtorIds: Array<Realtor["id"]>, timestamp: number) => Promise<OperationResponse<Array<Realtor["id"]>>>;
    realtorsSubscribe: (
        newRealtorHandler: (newRealtor: Realtor) => void,
        updatedRealtorHandler: (updatedRealtor: Realtor) => void,
        deletedRealtorHandler: (deletedRealtor: Realtor) => void,
    ) => Promise<OperationResponse>;
    realtorsUnsubscribe: () => void;
    //persons
    getPersons: (personIds: Array<Person['id']>) => Promise<OperationResponse<Array<Person>>>;
    searchPersonIds: (filter: PersonFilter) => Promise<OperationResponse<Array<Person['id']>>>;
    createPerson: (newPersonData: CreatePersonDTO) => Promise<OperationResponse>;
    updatePerson: (personId: Person["id"], updateData: UpdatePersonDTO) => Promise<OperationResponse>;
    deletePerson: (personId: Person['id']) => Promise<OperationResponse>;
    invalidatePersons: (personIds: Array<Person["id"]>, timestamp: number) => Promise<OperationResponse<Array<Person["id"]>>>;
    personsSubscribe: (
        newPersonHandler: (newPerson: Person) => void,
        updatedPersonHandler: (updatedPerson: Person) => void,
        deletedPersonHandler: (deletedPerson: Person) => void,
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
