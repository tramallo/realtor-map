/** Custom react-hook-form resolver that strips empty values before submitting
 */
import { Resolver, zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, ResolverOptions } from "react-hook-form";
import { ZodSchema, TypeOf as ZTypeOf } from "zod";

/** Checks if the provided value is an emtpy 
 * 
 * Considered empty (input -> output):
 * null -> true
 * undefined -> true
 * "" -> true
 * "  " -> true
 * {} -> true
 * [] -> true
 * { k: "value" } -> false
 * ["something"] -> false
 * "  .  " -> false
 * true -> false
 * 0 -> false
 * 
 * @param value: Value to check if is emtpy
 * @returns: Boolean indicating that the value is empty
 */
const isEmpty = <V>(value: V): boolean => {
    if (value == null || value == undefined) {
        return true;
    }

    if (typeof value == 'string' && value.trim() == "") {
        return true;
    }

    if (Array.isArray(value)) {
        if (value.length == 0) {
            return true;
        }
        return false;
    }

    if (typeof value == 'object' && Object.keys(value).length == 0) {
        return true;
    }

    return false;
};

/** Removes empty attributes from an object.
 * Creates a copy of the object discarding those attributes considered "empty"
 * 
 * @param input Object to remove empty attribute values
 * @returns A copy of the object without the attributes considered empty
 */
const stripEmptyAttributes = <T extends object> (input: T): T => {        
    const copy = {} as T;

    for (const inputKey in input) {
        if (Object.prototype.hasOwnProperty.call(input, inputKey)) {
            let inputValue = input[inputKey];

            if (isEmpty(inputValue)) {
                continue;
            }
            
            if (typeof inputValue == 'object' && !Array.isArray(inputValue)) {
                inputValue = stripEmptyAttributes(inputValue!);
                if (isEmpty(inputValue)) {
                    continue;
                }
            }

            copy[inputKey] = inputValue;
        }
    }

    return copy;
};

/** Creates a custom react-hook-form resolver that strips empty values from the input object 
 * and validates using zodResolver.
 * 
 * Reason:
 * ReactHookForm returns empty strings when user doesnt input anything. ex: { name: "" }
 * This can lead to overriding data on update operations or validation complexity, so, 
 * empty values are stripped away before validation.
 * 
 * for reference see:
 * https://www.react-hook-form.com/api/useform/#resolver
 * https://github.com/react-hook-form/resolvers
 * 
 * @param schema: Zod schema used to validate the input data
 * @returns: A resolver function that strips empty attributes from data, validates it and returns the result
 */
export const stripEmptyDataResolver: Resolver = <Schema extends ZodSchema>(
    schema: Schema
) => {
    const zodValidate = zodResolver<Schema>(schema);
  
    const stripEmptyDataAndValidate = async <Data extends FieldValues = ZTypeOf<Schema>>(
        data: Data,
        context: unknown,
        options: ResolverOptions<Data>
    ) => {
        const strippedData = stripEmptyAttributes(data);
        const result = await zodValidate<Data, unknown>(strippedData, context, options);
        return result;
    };

    return stripEmptyDataAndValidate;
};