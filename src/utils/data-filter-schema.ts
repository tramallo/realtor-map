import { z } from "zod";

import { dataIdSchema, propertyStates, propertyTypes, timestampSchema, userIdSchema } from "./data-schema";

export const baseDataFilterSchema = z.object({
    idEq: dataIdSchema.array().optional(),
    idNot: dataIdSchema.array().optional(),
    createdBy: userIdSchema.optional(),
    createdAtBefore: timestampSchema.optional(),
    createdAtAfter: timestampSchema.optional(),
    updatedBy: userIdSchema.optional(),
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
    ownerEq: dataIdSchema.optional(),
    relatedRealtorIds: dataIdSchema.array().optional(),
    exclusiveRealtorEq: dataIdSchema.optional(),
})

export const contractFilterSchema = baseDataFilterSchema.extend({
    client: dataIdSchema.optional(),
    property: dataIdSchema.optional(),
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