/** This file exposes data schemas used by the bussiness
 * and a custom resolver that helps input data gathering & validation
 * 
 * Such schemas have validation rules attached, provided by zod validator (https://zod.dev)
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, ResolverOptions } from "react-hook-form";
import { z } from "zod";

/** Removes empty attributes from a object, undefined & "" are considered empty
 * the process is recursive, so nested objects gets processed also
 * 
 * @param input: object to remove empty attributes
 * @returns: a copy of the object without the attributes equals to undefined or ""
 */
const stripEmptyAttributes = <T extends Record<string, unknown>>(input: T): T => {
    if (typeof input !== 'object' || input === null) {
        return input;
    }

    const result: Record<string, unknown> = {};

    for (const key of Object.keys(input)) {
        const value = input[key];
        if (value !== undefined && value !== "") {
            // Recursively strip empty attributes for nested objects
            if (typeof value === 'object' && value !== null) {
                const strippedValue = stripEmptyAttributes(value as Record<string, unknown>);
                if (Object.keys(strippedValue).length > 0) {
                    result[key] = strippedValue;
                }
            } else {
                result[key] = value;
            }
        }
    }

    return result as T;
}

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
export const getStripAndZodResolver = <TInput = unknown>(
    schema: z.ZodType<TInput>
) => {
    const zResolve = zodResolver(schema);
  
    const stripAndZodResolver = async <TFieldValues extends FieldValues>(
        data: TFieldValues,
        context: unknown,
        options: ResolverOptions<TFieldValues>
    ) => {
        const strippedData = stripEmptyAttributes(data);
        const result = await zResolve(strippedData, context, options);
        return result;
    };
    return stripAndZodResolver;
};

/** Base schemas, describes base data used by the system "as saved in database"
 */
export const dataSchema = z.object({
    id: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
    updatedBy: z.string().optional(),
    updatedAt: z.string().optional()
}) 

export const personSchema = z.object({
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
    owner: personSchema.optional(),
    realtors: realtorSchema.array().optional(),
    exclusive: realtorSchema.optional(),
    description: z.string().optional(),
})

export const showingAppointmentSchema = dataSchema.extend({
    property: propertySchema,
    agent: personSchema,
    client: personSchema,
    date: z.string(),
    time: z.string()
})

export type Person = z.infer<typeof personSchema>;
export type Realtor = z.infer<typeof realtorSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Property = z.infer<typeof propertySchema>;
export type ShowingAppointment = z.infer<typeof showingAppointmentSchema>;

/** Variation schemas, some operations use only parts of the data
 * 
 * ex: when creating new data, ids are not provided by user, if not specified, zod will expect & and validate an id,
 * so this shcemas are used on that scenarios 
 */
export const createPropertySchema = propertySchema.omit({
    id: true
})

export const updatePropertySchema = propertySchema.omit({
    id: true
}).partial()

export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;