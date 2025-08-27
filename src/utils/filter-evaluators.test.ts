import { expect, it, describe } from "vitest";

import { dataCompliesFilter, clientCompliesFilter, propertyCompliesFilter, realtorCompliesFilter } from "./filter-evaluators";
import { BaseData, Client, Property, Realtor } from "./data-schema";
import { BaseDataFilter, ClientFilter, PropertyFilter, RealtorFilter } from "./data-filter-schema";
import { dateToTimestamp } from "./helperFunctions";

describe("filter-evaluators", () => {
    describe("dataCompliesFilter", () => {
        const data1: BaseData = {
            id: 1,
            createdBy: crypto.randomUUID(),
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
        }
        const data2: BaseData = {
            id: 2,
            createdBy: crypto.randomUUID(),
            createdAt: dateToTimestamp(new Date("2000-09-04"))!,
            updatedBy: crypto.randomUUID(),
            updatedAt: dateToTimestamp(new Date("2000-09-14")),
            deleted: true,
        }

        describe("filter by idEq", () => {
            it("returns false when 'id' value doesnt match filter", () => {
                const filter: BaseDataFilter = { idEq: [3] };
                const result = dataCompliesFilter(data1, filter);
                
                expect(result).toBe(false);
            })
            
            it("returns true when 'id' value match filter", () => {
                const filter: BaseDataFilter = { idEq: [1] };
                const result = dataCompliesFilter(data1, filter);
                
                expect(result).toBe(true);
            })

            it("returns false when 'id' value is undefined", () => {
                const filter: BaseDataFilter = { idEq: [1] };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by idNeq", () => {
            it("returns false when 'id' is equal to a filtered id", () => {
                const filter: BaseDataFilter = { idNeq: [ 2, 1 ] };
                const result = dataCompliesFilter(data1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'id' doesnt match any of the filtered ids", () => {
                const filter: BaseDataFilter = { idNeq: [3, 4] };
                const result = dataCompliesFilter(data1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'id' is undefined", () => {
                const filter: BaseDataFilter = { idNeq: [ 3 ] };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by createdByEq", () => {
            it("returns false when 'createdBy' value doesnt match createdBy filter", () => {
                const filter: BaseDataFilter = { createdByEq: crypto.randomUUID() };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'createdBy' value match createdBy filter", () => {
                const filter: BaseDataFilter = { createdByEq: data1.createdBy };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'createdBy' value is undefined", () => {
                const filter: BaseDataFilter = { createdByEq: crypto.randomUUID() };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by createdAtEq", () => {
            describe("createdAt after", () => {
                it("returns false when 'createdAt' is before createdAtAfter filter", () => {
                    const filter: BaseDataFilter = { createdAtAfter: dateToTimestamp(new Date("1999-05-16")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'createdAt' value is after createdAtAfter filter", () => {
                    const filter: BaseDataFilter = { createdAtAfter: dateToTimestamp(new Date("1999-05-14")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'createdAt' value is equal to createdAtAfter filter", () => {
                    const filter: BaseDataFilter = { createdAtAfter: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
    
                it("returns false when 'createdAt' value is undefined", () => {
                    const filter: BaseDataFilter = { createdAtAfter: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter({} as BaseData, filter);
    
                    expect(result).toBe(false);
                })
            })
    
            describe("createdAt before", () => {
                it("returns false when 'createdAt' value is after createdAtBefore filter", () => {
                    const filter: BaseDataFilter = { createdAtBefore: dateToTimestamp(new Date("1999-05-14")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'createdAt' value is before createdAtBefore filter", () => {
                    const filter: BaseDataFilter = { createdAtBefore: dateToTimestamp(new Date("1999-05-16")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'createdAt' value is equal to createdAtBefore filter", () => {
                    const filter: BaseDataFilter = { createdAtBefore: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter(data1, filter);
        
                    expect(result).toBe(true);
                })
    
                it("returns false when 'createdAt' value is undefined", () => {
                    const filter: BaseDataFilter = { createdAtBefore: dateToTimestamp(new Date("1999-05-15")) };
                    const result = dataCompliesFilter({} as BaseData, filter);
    
                    expect(result).toBe(false);
                })
            })
        })

        describe("filter by updatedByEq", () => {
            it("returns false when 'updatedBy' value doesnt match updatedBy filter", () => {
                const filter: BaseDataFilter = { updatedByEq: crypto.randomUUID() };
                const result = dataCompliesFilter(data2, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'updatedBy' value match updatedBy filter", () => {
                const filter: BaseDataFilter = { updatedByEq: data1.updatedBy };
                const result = dataCompliesFilter(data2, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'updatedBy' value is undefined", () => {
                const filter: BaseDataFilter = { updatedByEq: crypto.randomUUID() };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by updatedAt", () => {
            describe("updatedAt after", () => {
                it("returns false when 'updatedAt' value is before updatedAtAfter filter", () => {
                    const filter: BaseDataFilter = { updatedAtAfter: dateToTimestamp(new Date("2000-09-15")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'updatedAt' value is after updatedAtAfter filter", () => {
                    const filter: BaseDataFilter = { updatedAtAfter: dateToTimestamp(new Date("2000-09-13")) }
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'updatedAt' value is equal to updatedAtAfter filter", () => {
                    const filter: BaseDataFilter = { updatedAtAfter: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })

                it("returns false when 'updatedAt' value is undefined", () => {
                    const filter: BaseDataFilter = { updatedAtAfter: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter({} as BaseData, filter);

                    expect(result).toBe(false);
                })
            })
    
            describe("updatedAt before", () => {
                it("returns false when 'updatedAt' value is after updatedAtBefore filter", () => {
                    const filter: BaseDataFilter = { updatedAtBefore: dateToTimestamp(new Date("2000-09-13")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(false);
                })
        
                it("returns true when 'updatedAt' value is before updatedAtBefore filter", () => {
                    const filter: BaseDataFilter = { updatedAtBefore: dateToTimestamp(new Date("2000-09-15")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })
        
                it("returns true when 'updatedAt' value is equal to updateAtBefore filter", () => {
                    const filter: BaseDataFilter = { updatedAtBefore: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter(data2, filter);
        
                    expect(result).toBe(true);
                })

                it("returns false when 'updatedAt' value is undefined", () => {
                    const filter: BaseDataFilter = { updatedAtBefore: dateToTimestamp(new Date("2000-09-14")) };
                    const result = dataCompliesFilter({} as BaseData, filter);

                    expect(result).toBe(false);
                })
            })
        })

        describe("filter by deletedEq", () => {
            it("returns false when 'deleted' value doesnt match filter", () => {
                const filter: BaseDataFilter = { deletedEq: true };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(false);
            })
    
            it("returns true when 'deleted' value match filter", () => {
                const filter: BaseDataFilter = { deletedEq: false };
                const result = dataCompliesFilter(data1, filter);
    
                expect(result).toBe(true);
            })

            it("returns false when 'deleted' value is undefined", () => {
                const filter: BaseDataFilter = { deletedEq: false };
                const result = dataCompliesFilter({} as BaseData, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("propertyCompliesFilter", () => {
        const property1: Property = {
            id: 1,
            createdBy: crypto.randomUUID(),
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
            address: "Liber Seregni 2401",
            coordinates: { lat: 1, lng: 1 },
            type: "apartment",
            state: "rented",
            owner: 2,
            description: "some description",
            exclusiveRealtor: 1,
            relatedRealtorIds: [ 2, 3 ],
        }

        describe("filter by addressLike", () => {
            it("returns false when 'address' value doesnt match filter", () => {
                const filter: PropertyFilter = { addressLike: "non.existent.address" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'address' value match filter", () => {
                const filter: PropertyFilter = { addressLike: "Liber Seregni 2401" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'address' value is undefined", () => {
                const filter: PropertyFilter = { addressLike: "Liber Seregni 2401" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by typeEq", () => {
            it("returns false when 'type' value doesnt match filter", () => {
                const filter: PropertyFilter = { typeEq: "house" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'type' value match filter", () => {
                const filter: PropertyFilter = { typeEq: "apartment" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'type' value is undefined", () => {
                const filter: PropertyFilter = { typeEq: "apartment" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by stateEq", () => {
            it("returns false when 'state' value doesnt match filter", () => {
                const filter: PropertyFilter = { stateEq: "available" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'state' value match filter", () => {
                const filter: PropertyFilter = { stateEq: "rented" };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'state' value is undefined", () => {
                const filter: PropertyFilter = { stateEq: "rented" };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by ownerEq", () => {
            it("returns false when 'owner' value doesnt match filter", () => {
                const filter: PropertyFilter = { ownerEq: 99 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'owner' value match filter", () => {
                const filter: PropertyFilter = { ownerEq: 2 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'owner' value is undefined", () => {
                const filter: PropertyFilter = { ownerEq: 2 };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by exclusiveRealtorEq", () => {
            it("returns false when 'exclusiveRealtor' value doesnt match filter", () => {
                const filter: PropertyFilter = { exclusiveRealtorEq: 99 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'exclusiveRealtor' value match filter", () => {
                const filter: PropertyFilter = { exclusiveRealtorEq: 1 };
                const result = propertyCompliesFilter(property1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'exclusiveRealtor' value is undefined", () => {
                const filter: PropertyFilter = { exclusiveRealtorEq: 1 };
                const result = propertyCompliesFilter({} as Property, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("realtorCompliesFilter", () => {
        const realtor1: Realtor = {
            id: 1,
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            createdBy: crypto.randomUUID(),
            deleted: false,
            name: "Gabana",
        }

        describe("filter by nameLike", () => {
            it("returns false when 'name' doesnt match filter", () => {
                const filter: RealtorFilter = { nameLike: "non.existent.name" };
                const result = realtorCompliesFilter(realtor1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'name' match filter", () => {
                const filter: RealtorFilter = { nameLike: "Gabana" };
                const result = realtorCompliesFilter(realtor1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'name' is undefined", () => {
                const filter: RealtorFilter = { nameLike: "Gabana" };
                const result = realtorCompliesFilter({} as Realtor, filter);

                expect(result).toBe(false);
            })
        })
    })

    describe("clientCompliesFilter", () => {
        const client1: Client = {
            id: 1,
            createdBy: crypto.randomUUID(),
            createdAt: dateToTimestamp(new Date("1999-05-15"))!,
            deleted: false,
            name: "Timothy",
            email: "timo@mail.com",
            mobile: "091234567"
        }

        describe("filter by nameLike", () => {
            it("returns false when 'name' doesnt match filter", () => {
                const filter: ClientFilter = { nameLike: "non.existent.name" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'name' match filter", () => {
                const filter: ClientFilter = { nameLike: "Timothy" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'name' is undefined", () => {
                const filter: ClientFilter = { nameLike: "Timothy" };
                const result = clientCompliesFilter({} as Client, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by emailLike", () => {
            it("returns false when 'email' value doesnt match filter", () => {
                const filter: ClientFilter = { emailLike: "non.existent.email" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'email' value match filter", () => {
                const filter: ClientFilter = { emailLike: "timo@mail.com" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'email' is undefined", () => {
                const filter: ClientFilter = { emailLike: "timo@mail.com" };
                const result = clientCompliesFilter({} as Client, filter);

                expect(result).toBe(false);
            })
        })

        describe("filter by mobileLike", () => {
            it("returns false when 'mobile' doesnt match filter", () => {
                const filter: ClientFilter = { mobileLike: "non.existent.mobile" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(false);
            })

            it("returns true when 'mobile' value match filter", () => {
                const filter: ClientFilter = { mobileLike: "091234567" };
                const result = clientCompliesFilter(client1, filter);

                expect(result).toBe(true);
            })

            it("returns false when 'mobile' is undefined", () => {
                const filter: ClientFilter = { mobileLike: "091234567" };
                const result = clientCompliesFilter({} as Client, filter);

                expect(result).toBe(false);
            })
        })
    })
})
