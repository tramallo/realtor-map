/** Schema of the domain data and dto's 
 */
import { z } from "zod";

// helpers
export const propertyTypes = ['house', 'apartment'] as const;
export const propertyStates = ['rented', 'available', 'reserved'] as const
export const dataIdSchema = z.number().int().positive().finite();
export const userIdSchema = z.string().uuid();
export const timestampSchema = z.number().int().positive().finite();
export const coordinatesSchema = z.object({
    lat: z.coerce.number().finite().safe(),
    lng: z.coerce.number().finite().safe()
})
export const baseDataSchema = z.object({
    id: dataIdSchema,
    createdBy: z.string().uuid(),
    createdAt: timestampSchema,
    updatedBy: z.string().uuid().optional(),
    updatedAt: timestampSchema.optional(),
    deleted: z.boolean().optional(),
})
export const PropertyTypesSchema = z.enum(propertyTypes);
export const PropertyStatesSchema = z.enum(propertyStates);

// entities
export const clientSchema = baseDataSchema.extend({
    name: z.string(),
    mobile: z.string().optional(),
    email: z.string().email().optional()
})
export const realtorSchema = baseDataSchema.extend({
    name: z.string()
})
export const propertySchema = baseDataSchema.extend({
    address: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(propertyTypes),
    state: z.enum(propertyStates).optional(),
    owner: dataIdSchema.optional(),
    exclusiveRealtor: dataIdSchema.optional(),
    relatedRealtorIds: dataIdSchema.array().optional(),
    description: z.string().optional(),
})
export const contractSchema = baseDataSchema.extend({
    property: dataIdSchema,
    client: dataIdSchema,
    start: timestampSchema,
    end: timestampSchema,
    description: z.string().optional(),
})

// dto's
export const createPropertyDTO = propertySchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})
export const updatePropertyDTO = propertySchema.omit({
    id: true,
    createdBy: true,
    createdAt: true
}).partial()
export const createClientDTO = clientSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})
export const updateClientDTO = clientSchema.omit({
    id: true,
    createdBy: true,
    createdAt: true
}).partial()
export const createRealtorDTO = realtorSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})
export const updateRealtorDTO = realtorSchema.omit({
    id: true,
    createdBy: true,
    createdAt: true,
}).partial()
export const createContractDTO = contractSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})
export const updateContractDTO = contractSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
}).partial()

export type PropertyType = z.infer<typeof PropertyTypesSchema>;
export type PropertyState = z.infer<typeof PropertyStatesSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;

export type BaseData = z.infer<typeof baseDataSchema>;
export type Client = z.infer<typeof clientSchema>;
export type Realtor = z.infer<typeof realtorSchema>;
export type Property = z.infer<typeof propertySchema>;
export type Contract = z.infer<typeof contractSchema>;

export type CreatePropertyDTO = z.infer<typeof createPropertyDTO>;
export type UpdatePropertyDTO = z.infer<typeof updatePropertyDTO>;
export type CreateClientDTO = z.infer<typeof createClientDTO>;
export type UpdateClientDTO = z.infer<typeof updateClientDTO>
export type CreateRealtorDTO = z.infer<typeof createRealtorDTO>;
export type UpdateRealtorDTO = z.infer<typeof updateRealtorDTO>;
export type CreateContractDTO = z.infer<typeof createContractDTO>;
export type UpdateContractDTO = z.infer<typeof updateContractDTO>;