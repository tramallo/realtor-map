import { BaseDataFilter, ContractFilter, ClientFilter, PropertyFilter, RealtorFilter } from "./data-filter-schema";
import { 
    BaseData, 
    Contract, 
    Client, 
    Property, 
    Realtor,
} from "./data-schema";

/** The logic on this evaluators must match the logic on backendApi search request.
 * Otherwise will cause that not all received data is shown, and incorrect data is shown from local storage 
 */
export const dataCompliesFilter = (data: BaseData, filter: BaseDataFilter): boolean => {
    if(filter.idEq && !filter.idEq.some((filterId) => filterId == data.id)) { return false }
    if(filter.idNeq && (data.id ? filter.idNeq.includes(data.id) : true)) { return false }
    if(filter.createdByEq && data.createdBy != filter.createdByEq) { return false }
    if(filter.createdAtBefore && (data.createdAt ?? Number.MAX_SAFE_INTEGER) > filter.createdAtBefore) { return false }
    if(filter.createdAtAfter && (data.createdAt ?? 0) < filter.createdAtAfter) { return false }
    if(filter.updatedByEq && data.updatedBy != filter.updatedByEq) { return false }
    if(filter.updatedAtBefore && (data.updatedAt ?? Number.MAX_SAFE_INTEGER) > filter.updatedAtBefore) { return false }
    if(filter.updatedAtAfter && (data.updatedAt ?? 0) < filter.updatedAtAfter) { return false }
    if(filter.deletedEq != undefined && data.deleted != filter.deletedEq) { return false }

    return true;
}

export const propertyCompliesFilter = (property: Property, filter: PropertyFilter): boolean => {
    if(!dataCompliesFilter(property, filter)) { return false }
    if (filter.addressLike) {
        const lowercasePropertyAddress = (property.address ?? "").toLowerCase();

        const lowercaseAddressFilter = filter.addressLike.toLowerCase();
        const filterWords = lowercaseAddressFilter.split(" ");

        if (filterWords.some((word) => !lowercasePropertyAddress.includes(word))) {
            return false;
        }
    }
    if(filter.typeEq && property.type != filter.typeEq) { return false }
    if(filter.stateEq && property.state != filter.stateEq) { return false }
    if(filter.ownerEq && property.owner != filter.ownerEq) { return false }
    if (
        filter.relatedRealtorIdsHas && 
        !filter.relatedRealtorIdsHas.every((filterRealtorId) => (property.relatedRealtorIds ?? []).includes(filterRealtorId))
    ) {
        return false;
    }
    if(
        filter.exclusiveRealtorEq && 
        property.exclusiveRealtor != filter.exclusiveRealtorEq
    ) { return false }

    return true;
}

export const realtorCompliesFilter = (realtor: Realtor, filter: RealtorFilter): boolean => {
    if(!dataCompliesFilter(realtor, filter)) { return false }
    if (filter.nameLike) {
        const lowercaseRealtorName = (realtor.name ?? "").toLowerCase();

        const lowercaseNameFilter = filter.nameLike.toLowerCase();
        const filterWords = lowercaseNameFilter.split(" ");

        if (filterWords.some((word) => !lowercaseRealtorName.includes(word))) {
            return false;
        }
    }

    return true;
}

export const clientCompliesFilter = (client: Client, filter: ClientFilter): boolean => {
    if(!dataCompliesFilter(client, filter)) { return false }
    if (filter.nameLike) {
        const lowercasePersonName = (client.name ?? "").toLowerCase();

        const lowercaseNameFilter = filter.nameLike.toLowerCase();
        const filterWords = lowercaseNameFilter.split(" ");

        if (filterWords.some((word) => !lowercasePersonName.includes(word))) {
            return false;
        }
    }
    if(filter.mobileLike && !(client.mobile ?? "").includes(filter.mobileLike)) { 
        return false;
    }
    if(filter.emailLike && !(client.email ?? "").includes(filter.emailLike)) { 
        return false 
    }

    return true;
}

export const contractCompliesFilter = (contract: Contract, filter: ContractFilter): boolean => {
    if (!dataCompliesFilter(contract, filter)) { return false }
    if (filter.clientEq && contract.client != filter.clientEq) { return false }
    if (filter.propertyEq && contract.property != filter.propertyEq) { return false }
    if (filter.startAfter && contract.start < filter.startAfter) { return false }
    if (filter.startBefore && contract.start > filter.startBefore) { return false }
    if (filter.endAfter && contract.end < filter.endAfter) { return false }
    if (filter.endBefore && contract.end > filter.endBefore) { return false }

    return true;
}