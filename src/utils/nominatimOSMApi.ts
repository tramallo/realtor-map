/** This file exposes a GeocodingService and a MapTilesService that are provided by Nominatim & OpenStreetMaps respectively
 */
import { createElement } from "react";

import {
  Location,
  GeocodingService,
  MapTilesService,
} from "./mapServicesSchemas";
import { OperationResponse } from "./helperFunctions";

const nominatimApiUrl = "https://nominatim.openstreetmap.org/search";

interface NominatimLocation {
  // not all values will be present, that depends on the request
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [
    number, //lat_min
    number, //lat_max
    number, //lon_min
    number //lon_max
  ];
  lat: number;
  lon: number;
  display_name: string; // human-readable name of the location
  class: string; // general classification ex: place|address|road|city|country
  type: string; // specific type of place ex: city|town|village|street|country
  importance: number; // importance of the result assigned by nominatim
  icon: string; // url of place icon
  address: {
    city: string;
    state_district: string;
    state: string;
    "ISO3166-2-lvl4": string; // ex: GB-ENG
    postcode: string; // ex: SW1A 2DU
    country: string;
    country_code: string; // 2 letter code for country ex: uy|eu
  };
  extratags: {
    capital: string; // ex: yes
    website: string;
    wikidata: string; // ex: Q84
    wikipedia: string; // ex: en:London
    population: number;
  };
}

/** Converts a location object returned by nominatim api to Location type 
 * 
 * @param nominatimLocation: location returned by nominatim (NominatimLocation)
 * @returns: Location
 */
const nominatimLocationToLocation = (
  nominatimLocation: NominatimLocation
): Location => {
  return {
    address: nominatimLocation.display_name,
    coordinates: { lat: nominatimLocation.lat, lng: nominatimLocation.lon },
  } as Location;
};

/** Peforms a geocode request to nominatim api and returns the results mapped to Location
 * 
 * @param searchValue: address to geocode
 * @returns: an array containing all locations related to the seach parameter
 */
const searchAddress = async (searchValue: string): Promise<OperationResponse<Location[]>> => {
  const searchParams = new URLSearchParams({
    q: searchValue,
    format: "json",
  }).toString();

  const searchUrl = `${nominatimApiUrl}?${searchParams}`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`Reponse non-2XX - ${JSON.stringify(response)}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Content type not supported - ${JSON.stringify(response)}`
      );
    }

    const responseBody = (await response.json()) as NominatimLocation[];

    const locations = responseBody.map(nominatimLocationToLocation);
    return { data: locations };
  } catch (error) {
    return { error: error as Error }
  }
};

/** Returns the url for openstreetmaps tiles api
 * 
 * @returns string url
 */
const getMapTilesUrl = async (): Promise<OperationResponse<string>> => {
  return { data: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` };
};

// export services
export const nominatimGeocodingService: GeocodingService = {
  searchAddress: searchAddress,
  attribution: createElement(
    "span",
    null,
    "Search results powered by ",
    createElement("a", { href: "https://nominatim.org" }, "Nominatim")
  ),
};

export const osmMapTilesService: MapTilesService = {
  getMapTilesUrl: getMapTilesUrl,
  attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
};
