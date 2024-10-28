import { z } from "zod";

// custom transformation & validation functions

/* emptyToUndefined() accepts any input value, returns undefined if the value is 'empty', otherwise returns the value
* 
* the following values are considered 'empty'
* empty array = []
* empty string = "" | "  " (spaces count as empty)
* empty object = {} | { key: undefined } (objects with undefined keys are empty)
* null
*/
export const emptyToUndefined = <T>(value: T | T[]): T | T[] | undefined => {
    if (value === null) {
        return undefined;
    } 
    if (Array.isArray(value)) {
        return value.length === 0 ? undefined : value;
    }
    if (typeof value === 'string') {
        return value.trim() === '' ? undefined : value;
    } 
    if (typeof value === 'object') {
        // object { key: undefined } or { key: "" } are considered empty, so returns undefined
        const someKeyNotEmpty = Object.values(value).some(val => val !== undefined && val != "");
        return someKeyNotEmpty ? value : undefined;
    }
    return value
};
//--

// BASE SCHEMAS
export const dataSchema = z.object({
    id: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string().optional(),
    updatedAt: z.string().optional()
})

export const personSchema = dataSchema.extend({
    name: z.preprocess(emptyToUndefined, z.string()),
    mobile: z.preprocess(emptyToUndefined, z.string().optional()),
    email: z.preprocess(emptyToUndefined, z.string().email().optional())
})

export const realtorSchema = dataSchema.extend({
    name: z.preprocess(emptyToUndefined, z.string())
})

export const coordinatesSchema = z.object({
    lat: z.preprocess(emptyToUndefined, z.coerce.number().finite().safe()),
    lng: z.preprocess(emptyToUndefined, z.coerce.number().finite().safe())
})

export const propertyTypes = ['house', 'apartment'] as const;
export const propertyStates = ['rented', 'available', 'reserved'] as const

export const propertySchema = dataSchema.extend({
    address: z.preprocess(emptyToUndefined, z.string()),
    coordinates: z.preprocess(emptyToUndefined, coordinatesSchema),
    type: z.preprocess(emptyToUndefined, z.enum(propertyTypes)),
    state: z.preprocess(emptyToUndefined, z.enum(propertyStates).optional()),
    owner: z.preprocess(emptyToUndefined, personSchema.optional()),
    realtors: z.preprocess(emptyToUndefined, realtorSchema.array().optional()),
    exclusive: z.preprocess(emptyToUndefined, realtorSchema.optional()),
    description: z.preprocess(emptyToUndefined, z.string().optional()),
})

export const showingAppointmentSchema = dataSchema.extend({
    property: z.preprocess(emptyToUndefined, propertySchema),
    agent: z.preprocess(emptyToUndefined, personSchema),
    client: z.preprocess(emptyToUndefined, personSchema),
    date: z.preprocess(emptyToUndefined, z.string()),
    time: z.preprocess(emptyToUndefined, z.string())
})

export type Person = z.infer<typeof personSchema>;
export type Realtor = z.infer<typeof realtorSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Property = z.infer<typeof propertySchema>;
export type ShowingAppointment = z.infer<typeof showingAppointmentSchema>;

// VARIATION SCHEMAS
export const createPropertySchema = propertySchema.omit({
    id: true
})

export const updatePropertySchema = propertySchema.omit({
    id: true
}).partial()

export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;