import { z } from "zod";

import { entryId, propertyStates, propertyTypes, timestampSchema } from "./data-schema";

export const baseDataFilterSchema = z.object({
    idEq: entryId.optional(),
    idNot: entryId.array().optional(),
    createdBy: entryId.optional(),
    createdAtBefore: timestampSchema.optional(),
    createdAtAfter: timestampSchema.optional(),
    updatedBy: entryId.optional(),
    updatedAtBefore: timestampSchema.optional(),
    updatedAtAfter: timestampSchema.optional(),
    deleted: z.boolean().optional(),
})

export const personFilterSchema = baseDataFilterSchema.extend({
    name: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
})

export const realtorFilterSchema = baseDataFilterSchema.extend({
    name: z.string().optional(),
})

export const propertyFilterSchema = baseDataFilterSchema.extend({
    address: z.string().optional(),
    type: z.enum(propertyTypes).optional(),
    state: z.enum(propertyStates).optional(),
    ownerId: entryId.optional(),
    relatedRealtorIds: entryId.array().optional(),
    exclusiveRealtorId: entryId.optional(),
})

export const contractFilterSchema = baseDataFilterSchema.extend({
    client: entryId.optional(),
    property: entryId.optional(),
    startBefore: timestampSchema.optional(),
    startAfter: timestampSchema.optional(),
    endBefore: timestampSchema.optional(),
    endAfter: timestampSchema.optional(),
})

export type BaseDataFilter = z.infer<typeof baseDataFilterSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type PersonFilter = z.infer<typeof personFilterSchema>;
export type RealtorFilter = z.infer<typeof realtorFilterSchema>;
export type ContractFilter = z.infer<typeof contractFilterSchema>;