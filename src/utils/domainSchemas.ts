/** This file exposes data schemas used by the bussiness
 * and a custom resolver that helps input data gathering & validation
 * 
 * Such schemas have validation rules attached, provided by zod validator (https://zod.dev)
 */
import { Resolver, zodResolver as zodResolverFactory } from "@hookform/resolvers/zod";
import { FieldValues, ResolverOptions } from "react-hook-form";
import { z, ZodSchema } from "zod";

/** Checks if the provided value is an emtpy value or not
 * Empty values are:
 * null - undefined - "" (after trimming) - {}
 * 
 * @param value: Value to check if is emtpy
 * @returns: Boolean indicating that the input is empty
 */
const isEmpty = <T = unknown>(value: T): boolean => {
    if (value == null || value == undefined) {
        return true;
    }

    if (typeof value === 'string' && value.trim() === "") {
        return true;
    }

    if (Array.isArray(value)) {
        return false;
    }

    if (typeof value === 'object' && Object.keys(value).length === 0) {
        return true;
    }

    return false;
};

/** Removes empty attributes from an object.
 * The process is recursive, so nested objects get their empty attributes removed also.
 * 
 * @param input: object to remove empty attributes
 * @returns: a copy of the object without the attributes considered empty
 */
const stripEmptyAttributes = <T>(input: T): T => {
    if (input == null || typeof input !== 'object') {
        return input; // Return as is if it's not an object
    }

    const copy = {} as T;

    for (const inputKey in input) {
        if (Object.prototype.hasOwnProperty.call(input, inputKey)) {
            let inputValue = input[inputKey];

            if (typeof inputValue === 'object' && inputValue !== null) {
                inputValue = stripEmptyAttributes(inputValue);
            }

            if (!isEmpty(inputValue)) {
                copy[inputKey] = inputValue;
            }
        }
    }

    return copy;
};

/** Creates a custom resolver that strips empty data & validates using zod.
 * 
 * ReactHookForm returns empty strings when user doesnt input anything { name: "" }
 * this can lead to overriding data on update operations & validation complexity, so, 
 * untouched fields (empty) are stripped away before validation.
 * 
 * for reference see:
 * https://www.react-hook-form.com/api/useform/#resolver
 * https://github.com/react-hook-form/resolvers
 * 
 * @param schema: zod schema to use to validate the input data
 * @returns: a resolver that strips empty attributes from data, validates it and returns the result
 */
export const customResolverFactory: Resolver = <Schema extends ZodSchema>(
    schema: Schema
) => {
    const zodResolve = zodResolverFactory<Schema>(schema);
  
    const customResolve = async <Data extends FieldValues = z.infer<Schema>>(
        data: Data,
        context: unknown,
        options: ResolverOptions<Data>
    ) => {
        const strippedData = stripEmptyAttributes(data);
        const result = await zodResolve<Data, unknown>(strippedData, context, options);
        return result;
    };

    return customResolve;
};

/** Base schemas, describes base data used by the system "as saved in database"
 */
const idSchema = z.string();

export const dataSchema = z.object({
    id: idSchema,
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string().optional(),
    updatedAt: z.string().optional()
}) 

export const personSchema = dataSchema.extend({
    name: z.string(),
    mobile: z.string().optional(),
    email: z.string().email().optional()
})

export const realtorSchema = dataSchema.extend({
    name: z.string()
})

export const coordinatesSchema = z.object({
    lat: z.coerce.number().finite().safe(),
    lng: z.coerce.number().finite().safe()
})

export const propertyTypes = ['house', 'apartment'] as const;
export const propertyStates = ['rented', 'available', 'reserved'] as const

export const propertySchema = dataSchema.extend({
    address: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(propertyTypes),
    state: z.enum(propertyStates).optional(),
    ownerId: idSchema.optional(),
    realtors: realtorSchema.array().optional(),
    exclusive: idSchema.optional(),
    description: z.string().optional(),
})

export const showingAppointmentSchema = dataSchema.extend({
    property: propertySchema,
    agent: personSchema,
    client: personSchema,
    date: z.string(),
    time: z.string()
})

export type PersonSchema = typeof personSchema;
export type RealtorSchema = typeof realtorSchema;
export type CoordinatesSchema = typeof coordinatesSchema;
export type PropertySchema = typeof propertySchema;
export type ShowingAppointmentSchema = typeof showingAppointmentSchema;

export type PersonData = z.infer<typeof personSchema>;
export type RealtorData = z.infer<typeof realtorSchema>;
export type CoordinatesData = z.infer<typeof coordinatesSchema>;
export type PropertyData = z.infer<typeof propertySchema>;
export type ShowingAppointmentData = z.infer<typeof showingAppointmentSchema>;

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

export const createRealtorSchema = realtorSchema.omit({
    id: true,
    updatedBy: true,
    updatedAt: true,
})

export type CreatePropertySchema = typeof createPropertySchema;
export type UpdatePropertySchema = typeof updatePropertySchema;
export type CreatePersonSchema = typeof createPersonSchema;
export type CreateRealtorSchema = typeof createRealtorSchema;

export type CreatePropertyData = z.infer<typeof createPropertySchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type CreatePersonData = z.infer<typeof createPersonSchema>;
export type CreateRealtorData = z.infer<typeof createRealtorSchema>;