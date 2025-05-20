import { z } from "zod";

import { dataIdSchema, propertyStates, propertyTypes, timestampSchema, userIdSchema } from "./data-schema";

export const baseDataFilterSchema = z.object({
    idEq: dataIdSchema.array().optional(),
    idNeq: dataIdSchema.array().optional(),
    createdByEq: userIdSchema.optional(),
    createdAtBefore: timestampSchema.optional(),
    createdAtAfter: timestampSchema.optional(),
    updatedByEq: userIdSchema.optional(),
    updatedAtBefore: timestampSchema.optional(),
    updatedAtAfter: timestampSchema.optional(),
    deletedEq: z.boolean().optional(),
})

export const clientFilterSchema = baseDataFilterSchema.extend({
    nameLike: z.string().optional(),
    mobileLike: z.string().optional(),
    emailLike: z.string().optional(),
})

export const realtorFilterSchema = baseDataFilterSchema.extend({
    nameLike: z.string().optional(),
})

export const propertyFilterSchema = baseDataFilterSchema.extend({
    addressLike: z.string().optional(),
    typeEq: z.enum(propertyTypes).optional(),
    stateEq: z.enum(propertyStates).optional(),
    ownerEq: dataIdSchema.optional(),
    relatedRealtorIdsHas: dataIdSchema.array().optional(),
    exclusiveRealtorEq: dataIdSchema.optional(),
})

export const contractFilterSchema = baseDataFilterSchema.extend({
    clientEq: dataIdSchema.optional(),
    propertyEq: dataIdSchema.optional(),
    startBefore: timestampSchema.optional(),
    startAfter: timestampSchema.optional(),
    endBefore: timestampSchema.optional(),
    endAfter: timestampSchema.optional(),
})

export type BaseDataFilter = z.infer<typeof baseDataFilterSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
export type RealtorFilter = z.infer<typeof realtorFilterSchema>;
export type ContractFilter = z.infer<typeof contractFilterSchema>;