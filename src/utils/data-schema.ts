/** This file exposes data schemas used by the bussiness
 * and a custom resolver that helps input data gathering & validation
 * 
 * Such schemas have validation rules attached, provided by zod validator (https://zod.dev)
 */
import { z } from "zod";

/** Base schemas, describes base data used by the system "as saved in database"
 */
export const propertyTypes = ['house', 'apartment'] as const;
export const propertyStates = ['rented', 'available', 'reserved'] as const

export const idSchema = z.number().int().positive().finite();
export const timestampSchema = z.number().int().positive().finite();

export const baseDataSchema = z.object({
    id: idSchema,
    createdBy: idSchema,
    createdAt: timestampSchema,
    updatedBy: idSchema.optional(),
    updatedAt: timestampSchema.optional(),
    deleted: z.boolean().optional(),
})

export const personSchema = baseDataSchema.extend({
    name: z.string(),
    mobile: z.string().optional(),
    email: z.string().email().optional()
})

export const realtorSchema = baseDataSchema.extend({
    name: z.string()
})

export const coordinatesSchema = z.object({
    lat: z.coerce.number().finite().safe(),
    lng: z.coerce.number().finite().safe()
})

export const propertySchema = baseDataSchema.extend({
    address: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(propertyTypes),
    state: z.enum(propertyStates).optional(),
    ownerId: idSchema.optional(),
    relatedRealtorIds: idSchema.array().optional(),
    exclusiveRealtorId: idSchema.optional(),
    description: z.string().optional(),
})

export const PropertyTypesSchema = z.enum(propertyTypes);
export const PropertyStatesSchema = z.enum(propertyStates);

export type BaseData = z.infer<typeof baseDataSchema>;
export type Person = z.infer<typeof personSchema>;
export type Realtor = z.infer<typeof realtorSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Property = z.infer<typeof propertySchema>;
export type PropertyType = z.infer<typeof PropertyTypesSchema>;
export type PropertyState = z.infer<typeof PropertyStatesSchema>;

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

export type CreatePropertyDTO = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDTO = z.infer<typeof updatePropertySchema>;
export type CreatePersonDTO = z.infer<typeof createPersonSchema>;
export type UpdatePersonDTO = z.infer<typeof updatePersonSchema>
export type CreateRealtorDTO = z.infer<typeof createRealtorSchema>;
export type UpdateRealtorDTO = z.infer<typeof updateRealtorSchema>;
