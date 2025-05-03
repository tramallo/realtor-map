import { expect, it, describe } from "vitest";

import { dataCompliesFilter, personCompliesFilter, propertyCompliesFilter, realtorCompliesFilter } from "./filter-evaluators";
import { 
    BaseData, 
    BaseFilterData, 
    Person, 
    PersonFilterData, 
    Property, 
    PropertyFilterData, 
    Realtor,
    RealtorFilterData, 
} from "./data-schema";
import { dateToTimestamp } from "./helperFunctions";

describe("filter-evaluators", () => {
    describe("dataCompliesFilter", () => {
        const data1: BaseData = {
            id: 1,
            createdBy: 1,
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
        }
        const data2: BaseData = {
            id: 2,
            createdBy: 2,
            createdAt: dateToTimestamp(new Date("2000-09-04"))!,
            updatedBy: 3,
            updatedAt: dateToTimestamp(new Date("2000-09-14")),
            deleted: true,
        }

        describe("filter by idEq", () => {
            it("returns false when 'id' value doesnt match filter", () => {
                const filter: BaseFilterData = { idEq: 3 };
                const result = dataCompliesFilter(data1, filter);
                
                expect(result).toBe(false);
            })
            
            it("returns true when 'id' value match filter", () => {
                const filter: BaseFilterData = { idEq: 1 };
                const result = dataCompliesFilter(data1, filter);
                
                expect(result).toBe(true);
            })

            it("returns false when 'id' value is undefined", () => {
                const filter: BaseFilterData = { idEq: 1 };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by idNot", () => {
            it("returns false when 'id' is equal to a filtered id", () => {
                const filter: BaseFilterData = { idNot: [ 2, 1 ] };
                const result = dataCompliesFilter(data1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'id' doesnt match any of the filtered ids", () => {
                const filter: BaseFilterData = { idNot: [3, 4] };
                const result = dataCompliesFilter(data1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'id' is undefined", () => {
                const filter: BaseFilterData = { idNot: [ 3 ] };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by createdBy", () => {
            it("returns false when 'createdBy' value doesnt match createdBy filter", () => {
                const filter: BaseFilterData = { createdBy: 3 };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'createdBy' value match createdBy filter", () => {
                const filter: BaseFilterData = { createdBy: 1 };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'createdBy' value is undefined", () => {
                const filter: BaseFilterData = { createdBy: 1 };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by createdAt", () => {
            describe("createdAt after", () => {
                it("returns false when 'createdAt' is before createdAtAfter filter", () => {
                    const filter: BaseFilterData = { createdAtAfter: dateToTimestamp(new Date("1999-05-16")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'createdAt' value is after createdAtAfter filter", () => {
                    const filter: BaseFilterData = { createdAtAfter: dateToTimestamp(new Date("1999-05-14")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'createdAt' value is equal to createdAtAfter filter", () => {
                    const filter: BaseFilterData = { createdAtAfter: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
    
                it("returns false when 'createdAt' value is undefined", () => {
                    const filter: BaseFilterData = { createdAtAfter: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter({} as BaseData, filter);
    
                    expect(result).toBe(false);
                })
            })
    
            describe("createdAt before", () => {
                it("returns false when 'createdAt' value is after createdAtBefore filter", () => {
                    const filter: BaseFilterData = { createdAtBefore: dateToTimestamp(new Date("1999-05-14")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'createdAt' value is before createdAtBefore filter", () => {
                    const filter: BaseFilterData = { createdAtBefore: dateToTimestamp(new Date("1999-05-16")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'createdAt' value is equal to createdAtBefore filter", () => {
                    const filter: BaseFilterData = { createdAtBefore: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
    
                it("returns false when 'createdAt' value is undefined", () => {
                    const filter: BaseFilterData = { createdAtBefore: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter({} as BaseData, filter);
    
                    expect(result).toBe(false);
                })
            })
        })

        describe("filter by updatedBy", () => {
            it("returns false when 'updatedBy' value doesnt match updatedBy filter", () => {
                const filter: BaseFilterData = { updatedBy: 4 };
                const result = dataCompliesFilter(data2, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'updatedBy' value match updatedBy filter", () => {
                const filter: BaseFilterData = { updatedBy: 3 };
                const result = dataCompliesFilter(data2, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'updatedBy' value is undefined", () => {
                const filter: BaseFilterData = { updatedBy: 3 };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by updatedAt", () => {
            describe("updatedAt after", () => {
                it("returns false when 'updatedAt' value is before updatedAtAfter filter", () => {
                    const filter: BaseFilterData = { updatedAtAfter: dateToTimestamp(new Date("2000-09-15")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'updatedAt' value is after updatedAtAfter filter", () => {
                    const filter: BaseFilterData = { updatedAtAfter: dateToTimestamp(new Date("2000-09-13")) }
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'updatedAt' value is equal to updatedAtAfter filter", () => {
                    const filter: BaseFilterData = { updatedAtAfter: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })

                it("returns false when 'updatedAt' value is undefined", () => {
                    const filter: BaseFilterData = { updatedAtAfter: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter({} as BaseData, filter);

                    expect(result).toBe(false);
                })
            })
    
            describe("updatedAt before", () => {
                it("returns false when 'updatedAt' value is after updatedAtBefore filter", () => {
                    const filter: BaseFilterData = { updatedAtBefore: dateToTimestamp(new Date("2000-09-13")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'updatedAt' value is before updatedAtBefore filter", () => {
                    const filter: BaseFilterData = { updatedAtBefore: dateToTimestamp(new Date("2000-09-15")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'updatedAt' value is equal to updateAtBefore filter", () => {
                    const filter: BaseFilterData = { updatedAtBefore: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })

                it("returns false when 'updatedAt' value is undefined", () => {
                    const filter: BaseFilterData = { updatedAtBefore: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter({} as BaseData, filter);

                    expect(result).toBe(false);
                })
            })
        })

        describe("filter by deleted", () => {
            it("returns false when 'deleted' value doesnt match filter", () => {
                const filter: BaseFilterData = { deleted: true };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'deleted' value match filter", () => {
                const filter: BaseFilterData = { deleted: false };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'deleted' value is undefined", () => {
                const filter: BaseFilterData = { deleted: false };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("propertyCompliesFilter", () => {
        const property1: Property = {
            id: 1,
            createdBy: 1,
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
            address: "Liber Seregni 2401",
            coordinates: { lat: 1, lng: 1 },
            type: "apartment",
            state: "rented",
            ownerId: 2,
            description: "some description",
            exclusiveRealtorId: 1,
            relatedRealtorIds: [ 2, 3 ],
        }

        describe("filter by address", () => {
            it("returns false when 'address' value doesnt match filter", () => {
                const filter: PropertyFilterData = { address: "non.existent.address" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'address' value match filter", () => {
                const filter: PropertyFilterData = { address: "Liber Seregni 2401" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'address' value is undefined", () => {
                const filter: PropertyFilterData = { address: "Liber Seregni 2401" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by type", () => {
            it("returns false when 'type' value doesnt match filter", () => {
                const filter = { type: "non.existent.type" } as unknown as PropertyFilterData;
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'type' value match filter", () => {
                const filter: PropertyFilterData = { type: "apartment" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'type' value is undefined", () => {
                const filter: PropertyFilterData = { type: "apartment" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by state", () => {
            it("returns false when 'state' value doesnt match filter", () => {
                const filter = { state: "non.existent.state" } as unknown as PropertyFilterData;
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'state' value match filter", () => {
                const filter: PropertyFilterData = { state: "rented" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'state' value is undefined", () => {
                const filter: PropertyFilterData = { state: "rented" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by ownerId", () => {
            it("returns false when 'ownerId' value doesnt match filter", () => {
                const filter: PropertyFilterData = { ownerId: 99 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'ownerId' value match filter", () => {
                const filter: PropertyFilterData = { ownerId: 2 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'ownerId' value is undefined", () => {
                const filter: PropertyFilterData = { ownerId: 2 };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by exclusiveRealtorId", () => {
            it("returns false when 'exclusiveRealtorId' value doesnt match filter", () => {
                const filter: PropertyFilterData = { exclusiveRealtorId: 99 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'exclusiveRealtorId' value match filter", () => {
                const filter: PropertyFilterData = { exclusiveRealtorId: 1 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'exclusiveRealtorId' value is undefined", () => {
                const filter: PropertyFilterData = { exclusiveRealtorId: 1 };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by relatedRealtorIds", () => {
            it("returns false when no value on 'relatedRealtorIds' match filter", () => {
                const filter: PropertyFilterData = { relatedRealtorIds: [4, 5] };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it.each([
                [2],
                [2, 3],
            ])("returns true when all values on filter are present on 'relatedRealtorIds'", (...filterValue) => {
                const filter: PropertyFilterData = { relatedRealtorIds: filterValue };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when not all values on filter are present on 'relatedRealtorIds'", () => {
                const filter: PropertyFilterData = { relatedRealtorIds: [2, 3, 4] };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns false when 'relatedRealtorIds' is undefined", () => {
                const filter: PropertyFilterData = { relatedRealtorIds: [2, 3] };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("realtorCompliesFilter", () => {
        const realtor1: Realtor = {
            id: 1,
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            createdBy: 1,
            deleted: false,
            name: "Gabana",
        }

        describe("filter by name", () => {
            it("returns false when 'name' doesnt match filter", () => {
                const filter: RealtorFilterData = { name: "non.existent.name" };
                const result = realtorCompliesFilter(realtor1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'name' match filter", () => {
                const filter: RealtorFilterData = { name: "Gabana" };
                const result = realtorCompliesFilter(realtor1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'name' is undefined", () => {
                const filter: RealtorFilterData = { name: "Gabana" };
                const result = realtorCompliesFilter({} as Realtor, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("personCompliesFilter", () => {
        const person1: Person = {
            id: 1,
            createdBy: 1,
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
            name: "Timothy",
            email: "timo@mail.com",
            mobile: "091234567"
        }

        describe("filter by name", () => {
            it("returns false when 'name' doesnt match filter", () => {
                const filter: PersonFilterData = { name: "non.existent.name" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'name' match filter", () => {
                const filter: PersonFilterData = { name: "Timothy" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'name' is undefined", () => {
                const filter: PersonFilterData = { name: "Timothy" };
                const result = personCompliesFilter({} as Person, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by email", () => {
            it("returns false when 'email' value doesnt match filter", () => {
                const filter: PersonFilterData = { email: "non.existent.email" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'email' value match filter", () => {
                const filter: PersonFilterData = { email: "timo@mail.com" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'email' is undefined", () => {
                const filter: PersonFilterData = { email: "timo@mail.com" };
                const result = personCompliesFilter({} as Person, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by mobile", () => {
            it("returns false when 'mobile' doesnt match filter", () => {
                const filter: PersonFilterData = { mobile: "non.existent.mobile" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'mobile' value match filter", () => {
                const filter: PersonFilterData = { mobile: "091234567" };
                const result = personCompliesFilter(person1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'mobile' is undefined", () => {
                const filter: PersonFilterData = { mobile: "091234567" };
                const result = personCompliesFilter({} as Person, filter);

                expect(result).toBe(false);
            })
        })
    })
})
