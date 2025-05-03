import { z } from "zod";

import { idSchema, propertyStates, propertyTypes, timestampSchema } from "./data-schema";

export const baseDataFilterSchema = z.object({
    idEq: idSchema.optional(),
    idNot: idSchema.array().optional(),
    createdBy: idSchema.optional(),
    createdAtBefore: timestampSchema.optional(),
    createdAtAfter: timestampSchema.optional(),
    updatedBy: idSchema.optional(),
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
    ownerId: idSchema.optional(),
    relatedRealtorIds: idSchema.array().optional(),
    exclusiveRealtorId: idSchema.optional(),
})

export type BaseDataFilter = z.infer<typeof baseDataFilterSchema>;
export type PropertyFilter = z.infer<typeof propertyFilterSchema>;
export type PersonFilter = z.infer<typeof personFilterSchema>;
export type RealtorFilter = z.infer<typeof realtorFilterSchema>;