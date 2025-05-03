/** This file exposes data schemas used by the bussiness
 * and a custom resolver that helps input data gathering & validation
 * 
 * Such schemas have validation rules attached, provided by zod validator (https://zod.dev)
 */
import { z } from "zod";

/** Base schemas, describes base data used by the system "as saved in database"
 */
const idSchema = z.number().int().positive().finite();
const timestampSchema = z.number().int().positive().finite();

export const baseFilterSchema = z.object({
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
export const baseSchema = z.object({
    id: idSchema,
    createdBy: idSchema,
    createdAt: timestampSchema,
    updatedBy: idSchema.optional(),
    updatedAt: timestampSchema.optional(),
    deleted: z.boolean().optional(),
})

export const personFilterSchema = baseFilterSchema.extend({
    name: z.string().optional(),
    mobile: z.string().optional(),
    email: z.string().optional(),
})
export const personSchema = baseSchema.extend({
    name: z.string(),
    mobile: z.string().optional(),
    email: z.string().email().optional()
})

export const realtorFilterSchema = baseFilterSchema.extend({
    name: z.string().optional(),
})
export const realtorSchema = baseSchema.extend({
    name: z.string()
})

export const coordinatesSchema = z.object({
    lat: z.coerce.number().finite().safe(),
    lng: z.coerce.number().finite().safe()
})

export const propertyTypes = ['house', 'apartment'] as const;
export const propertyStates = ['rented', 'available', 'reserved'] as const

export const propertyFilterSchema = baseFilterSchema.extend({
    address: z.string().optional(),
    type: z.enum(propertyTypes).optional(),
    state: z.enum(propertyStates).optional(),
    ownerId: idSchema.optional(),
    relatedRealtorIds: idSchema.array().optional(),
    exclusiveRealtorId: idSchema.optional(),
})
export const propertySchema = baseSchema.extend({
    address: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(propertyTypes),
    state: z.enum(propertyStates).optional(),
    ownerId: idSchema.optional(),
    relatedRealtorIds: idSchema.array().optional(),
    exclusiveRealtorId: idSchema.optional(),
    description: z.string().optional(),
})

export const showingAppointmentSchema = baseSchema.extend({
    property: propertySchema,
    agent: personSchema,
    client: personSchema,
    date: z.string(),
    time: z.string()
})

export const PropertyTypesSchema = z.enum(propertyTypes);
export const PropertyStatesSchema = z.enum(propertyStates);

export type BaseData = z.infer<typeof baseSchema>;
export type PersonData = z.infer<typeof personSchema>;
export type RealtorData = z.infer<typeof realtorSchema>;
export type CoordinatesData = z.infer<typeof coordinatesSchema>;
export type PropertyData = z.infer<typeof propertySchema>;
export type ShowingAppointmentData = z.infer<typeof showingAppointmentSchema>;
export type PropertyType = z.infer<typeof PropertyTypesSchema>;
export type PropertyState = z.infer<typeof PropertyStatesSchema>;

export type BaseFilterData = z.infer<typeof baseFilterSchema>;
export type PropertyFilterData = z.infer<typeof propertyFilterSchema>;
export type PersonFilterData = z.infer<typeof personFilterSchema>;
export type RealtorFilterData = z.infer<typeof realtorFilterSchema>;

/** Variation schemas, some operations use only parts of the data
 * 
 * ex: when creating new data, ids are not provided by user, if not specified, zod will expect & and validate an id,
 * so this shcemas are used on that scenarios 
 */
export const createPropertySchema = propertySchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})

export const updatePropertySchema = propertySchema.omit({
    id: true,
    createdBy: true,
    createdAt: true
}).partial()

export const createPersonSchema = personSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})

export const updatePersonSchema = personSchema.omit({
    id: true,
    createdBy: true,
    createdAt: true
}).partial()

export const createRealtorSchema = realtorSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})

export const updateRealtorSchema = realtorSchema.omit({
    id: true,
    createdBy: true,
    createdAt: true,
}).partial()

export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type CreatePersonData = z.infer<typeof createPersonSchema>;
export type UpdatePersonData = z.infer<typeof updatePersonSchema>
export type CreateRealtorData = z.infer<typeof createRealtorSchema>;
export type UpdateRealtorData = z.infer<typeof updateRealtorSchema>;
