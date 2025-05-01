/** This file provides a common interface to integrate 
 * different geocoding & map tiles services with the components that consume it
 */

import { OperationResponse } from "./helperFunctions";

/** Address info expected from geocoding services responses
 */
export interface Location {
    address: string;
    coordinates: { lat: number; lng: number };
}

/** Geocoding services must expose a searchAddress function
 * and a attribution element to pray the required attribution by them
 */
export interface GeocodingService {
    searchAddress: (searchValue: string) => Promise<OperationResponse<Location[]>>;
    attribution: React.ReactElement
}

/** MapTiles services must expose a getMaptilesUrl that returns a url that can be used to fetch tiles
 * and the proper attribution (Leaflet interprets this string, so you can write a link tag on it)
 */
export interface MapTilesService {
    getMapTilesUrl: () => Promise<OperationResponse<string>>;
    attribution: string
}