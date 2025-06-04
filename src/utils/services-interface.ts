import { 
    ContractFilter, 
    ClientFilter, 
    PropertyFilter, 
    RealtorFilter, 
    SortConfig,
    PaginationCursor, 
} from "./data-filter-schema";
import { Contract, 
    CreateContractDTO, 
    CreateClientDTO, 
    CreatePropertyDTO, 
    CreateRealtorDTO, 
    Client, 
    Property, 
    Realtor, 
    UpdateContractDTO, 
    UpdateClientDTO, 
    UpdatePropertyDTO, 
    UpdateRealtorDTO 
} from "./data-schema";
import { OperationResponse } from "./helperFunctions";

export interface BackendApi {
    //properties
    getProperties: (propertyIds: Array<Property['id']>) => Promise<OperationResponse<Array<Property>>>;
    searchPropertyIds: (
        filter: PropertyFilter, 
        order: SortConfig<Property>, 
        recordsPerPage: number,
        paginationCursor: PaginationCursor<Property> | undefined,
    ) => Promise<OperationResponse<Array<Property['id']>>>;
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
    searchRealtorIds: (
        filter: RealtorFilter,
        order: SortConfig<Realtor>, 
        recordsPerPage: number,
        paginationCursor: PaginationCursor<Realtor> | undefined,
    ) => Promise<OperationResponse<Array<Realtor['id']>>>;
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
    //clients
    getClients: (clientIds: Array<Client['id']>) => Promise<OperationResponse<Array<Client>>>;
    searchClientIds: (
        filter: ClientFilter,
        order: SortConfig<Client>, 
        recordsPerPage: number,
        paginationCursor: PaginationCursor<Client> | undefined,
    ) => Promise<OperationResponse<Array<Client['id']>>>;
    createClient: (newClientData: CreateClientDTO) => Promise<OperationResponse>;
    updateClient: (clientId: Client["id"], updateData: UpdateClientDTO) => Promise<OperationResponse>;
    deleteClient: (clientId: Client['id']) => Promise<OperationResponse>;
    invalidateClients: (clientIds: Array<Client["id"]>, timestamp: number) => Promise<OperationResponse<Array<Client["id"]>>>;
    clientsSubscribe: (
        newClientHandler: (newClient: Client) => void,
        updatedClientHandler: (updatedClient: Client) => void,
        deletedClientHandler: (deletedClient: Client) => void,
    ) => Promise<OperationResponse>;
    clientsUnsubscribe: () => void;
    // contracts
    getContracts: (contractIds: Array<Contract['id']>) => Promise<OperationResponse<Array<Contract>>>;
    searchContractIds: (
        filter: ContractFilter,
        order: SortConfig<Contract>, 
        recordsPerPage: number,
        paginationCursor: PaginationCursor<Contract> | undefined,
    ) => Promise<OperationResponse<Array<Contract['id']>>>;
    createContract: (newContractData: CreateContractDTO) => Promise<OperationResponse>;
    updateContract: (contractId: Contract["id"], updateData: UpdateContractDTO) => Promise<OperationResponse>;
    deleteContract: (contractId: Contract['id']) => Promise<OperationResponse>;
    invalidateContracts: (contractIds: Array<Contract["id"]>, timestamp: number) => Promise<OperationResponse<Array<Contract["id"]>>>;
    contractsSubscribe: (
        newContractHandler: (newContract: Contract) => void,
        updatedContractHandler: (updatedContract: Contract) => void,
        deletedContractHandler: (deletedContract: Contract) => void,
    ) => Promise<OperationResponse>;
    contractsUnsubscribe: () => void;
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
