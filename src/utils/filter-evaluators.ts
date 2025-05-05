import { BaseDataFilter, ContractFilter, PersonFilter, PropertyFilter, RealtorFilter } from "./data-filter-schema";
import { 
    BaseData, 
    Contract, 
    Person, 
    Property, 
    Realtor,
} from "./data-schema";

/** The logic on this evaluators must match the logic on backendApi search request.
 * Otherwise will cause that not all received data is shown, and incorrect data is shown from local storage 
 */
export const dataCompliesFilter = (data: BaseData, filter: BaseDataFilter): boolean => {
    if(filter.idEq && data.id != filter.idEq) { return false }
    if(filter.idNot && (data.id ? filter.idNot.includes(data.id) : true)) { return false }
    if(filter.createdBy && data.createdBy != filter.createdBy) { return false }
    if(filter.createdAtBefore && (data.createdAt ?? Number.MAX_SAFE_INTEGER) > filter.createdAtBefore) { return false }
    if(filter.createdAtAfter && (data.createdAt ?? 0) < filter.createdAtAfter) { return false }
    if(filter.updatedBy && data.updatedBy != filter.updatedBy) { return false }
    if(filter.updatedAtBefore && (data.updatedAt ?? Number.MAX_SAFE_INTEGER) > filter.updatedAtBefore) { return false }
    if(filter.updatedAtAfter && (data.updatedAt ?? 0) < filter.updatedAtAfter) { return false }
    if(filter.deleted != undefined && data.deleted != filter.deleted) { return false }

    return true;
}

export const propertyCompliesFilter = (property: Property, filter: PropertyFilter): boolean => {
    if(!dataCompliesFilter(property, filter)) { return false }
    if (filter.address) {
        const lowercasePropertyAddress = (property.address ?? "").toLowerCase();

        const lowercaseAddressFilter = filter.address.toLowerCase();
        const filterWords = lowercaseAddressFilter.split(" ");

        if (filterWords.some((word) => !lowercasePropertyAddress.includes(word))) {
            return false;
        }
    }
    if(filter.type && property.type != filter.type) { return false }
    if(filter.state && property.state != filter.state) { return false }
    if(filter.ownerId && property.ownerId != filter.ownerId) { return false }
    if (
        filter.relatedRealtorIds && 
        !filter.relatedRealtorIds.every((filterRealtorId) => (property.relatedRealtorIds ?? []).includes(filterRealtorId))
    ) {
        return false;
    }
    if(
        filter.exclusiveRealtorId && 
        property.exclusiveRealtorId != filter.exclusiveRealtorId
    ) { return false }

    return true;
}

export const realtorCompliesFilter = (realtor: Realtor, filter: RealtorFilter): boolean => {
    if(!dataCompliesFilter(realtor, filter)) { return false }
    if (filter.name) {
        const lowercaseRealtorName = (realtor.name ?? "").toLowerCase();

        const lowercaseNameFilter = filter.name.toLowerCase();
        const filterWords = lowercaseNameFilter.split(" ");

        if (filterWords.some((word) => !lowercaseRealtorName.includes(word))) {
            return false;
        }
    }

    return true;
}

export const personCompliesFilter = (person: Person, filter: PersonFilter): boolean => {
    if(!dataCompliesFilter(person, filter)) { return false }
    if (filter.name) {
        const lowercasePersonName = (person.name ?? "").toLowerCase();

        const lowercaseNameFilter = filter.name.toLowerCase();
        const filterWords = lowercaseNameFilter.split(" ");

        if (filterWords.some((word) => !lowercasePersonName.includes(word))) {
            return false;
        }
    }
    if(filter.mobile && person.mobile != filter.mobile) { return false }
    if(filter.email && person.email != filter.email) { return false }

    return true;
}

export const contractCompliesFilter = (contract: Contract, filter: ContractFilter): boolean => {
    if (!dataCompliesFilter(contract, filter)) { return false }
    if (filter.client && contract.client != filter.client) { return false }
    if (filter.property && contract.property != filter.property) { return false }
    if (filter.startAfter && contract.start < filter.startAfter) { return false }
    if (filter.startBefore && contract.start > filter.startBefore) { return false }
    if (filter.endAfter && contract.end < filter.endAfter) { return false }
    if (filter.endBefore && contract.end > filter.endBefore) { return false }

    return true;
}