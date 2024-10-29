import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, ResolverOptions } from "react-hook-form";
import { z } from "zod";

// custom transformation & validation functions
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

export const customResolver = <TInput = unknown>(
    schema: z.ZodType<TInput>
) => {
    const zResolve = zodResolver(schema);
  
    return async <TFieldValues extends FieldValues>(
        data: TFieldValues,
        context: unknown,
        options: ResolverOptions<TFieldValues>
    ) => {
        const strippedData = stripEmptyAttributes(data);
        const result = await zResolve(strippedData, context, options);
        return result;
    };
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

// VARIATION SCHEMAS
export const createPropertySchema = propertySchema.omit({
    id: true
})

export const updatePropertySchema = propertySchema.omit({
    id: true
}).partial()

export type CreateProperty = z.infer<typeof createPropertySchema>;
export type UpdateProperty = z.infer<typeof updatePropertySchema>;