import { format, isValid } from "date-fns";

import { BaseData } from "./data-schema";
import { SortConfig, PaginationCursor } from "./data-filter-schema";

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

export const createSearchIndex = <Objects extends Array<unknown>>(...objects: Objects): SearchIndex => {
  const objStrings = objects.map(object => JSON.stringify(object));
  //return empty string "" for undefined inputs
  return objStrings.join("::");
}
export const parseSearchIndex = <Objects extends Array<unknown>>(searchIndex: SearchIndex): Objects => {
  const objStrings = searchIndex.split("::");
  //return undefined for empty strings ""
  return objStrings.map(objString => objString ? JSON.parse(objString) : undefined) as Objects;
}

//FIXME: PaginationCursor should to allow this
export const createPaginationCursor = <T extends BaseData>(record: T, sortConfig: SortConfig<T>): PaginationCursor<T> => {
  const cursor: PaginationCursor<T> = { id: record.id };
  
  sortConfig.forEach(sortEntry => {
    const recordValue = record[sortEntry.column];
    cursor[sortEntry.column] = recordValue;
  })

  return cursor;
}

export const getLocalStorageData = <T extends object | string | number>(storageKey: string): OperationResponse<T | undefined> => {
  const rawLocalStorageData = localStorage.getItem(storageKey);

  if (!rawLocalStorageData) {
    return { data: undefined };
  }

  try {
    const parsedLocalStorageData = JSON.parse(rawLocalStorageData);
    return { data: parsedLocalStorageData as T };
  } catch (error) {
    return { error: error as Error };
  }
}

export const countDefinedAttributes = <T extends Record<string, unknown>>(object: T) => {
  return Object.keys(object).filter(key => object[key] !== undefined).length;
}

export type DataStorage<Data extends BaseData = BaseData> = Record<Data["id"], Data | undefined>;

export type SearchIndex = string;
export type SearchDataResult<Data extends BaseData = BaseData> = {
  dataIds: Array<Data["id"]>,
  totalRows?: number,
  loading?: boolean
}
export type SearchDataResults<Data extends BaseData = BaseData> = Map<SearchIndex, SearchDataResult<Data>>