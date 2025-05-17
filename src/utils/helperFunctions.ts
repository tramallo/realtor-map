import { format, isValid } from "date-fns";

interface SuccessResponse<T> {
  data: T;
  error?: undefined;
}
interface ErrorResponse {
  data?: undefined;
  error: Error
}
export type OperationResponse<T = undefined> = SuccessResponse<T> | ErrorResponse

export const dateToTimestamp = (date: Date | null | undefined): number | undefined => {
  if (!date || !isValid(date)) {
    return undefined;
  }

  return Math.floor(date.getTime() / 1000);
}
export const timestampToDate = (timestamp: number | undefined): Date | null => {
  if (!timestamp) {
    return null;
  }

  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  if (!isValid(date)) {
    return null;
  }

  return date;
}
export const timestampToDDMMYYString = (timestamp: number): string | undefined => {
  const asDate = timestampToDate(timestamp);
  if (!asDate) {
    return undefined;
  }

  return format(asDate, "dd/MM/yy");
}

export const countDefinedAttributes = <T extends Record<string, unknown>>(object: T) => {
  return Object.keys(object).filter(key => object[key] !== undefined).length;
}
