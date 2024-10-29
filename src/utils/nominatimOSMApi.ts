/** This file exposes a GeocodingService and a MapTilesService that are provided by Nominatim & OpenStreetMaps respectively
 */
import { createElement } from "react";
import {
  AddressData,
  GeocodingService,
  MapTilesService,
} from "./mapServicesSchemas";

const nominatimApiUrl = "https://nominatim.openstreetmap.org/search";

interface NominatimAddress {
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

/** Converts an address object returned by nominatim api to a local address type (AddressData) 
 * 
 * @param nominatimAddress: address returned by nominatim NominatimAddress
 * @returns: local address type AddressData
 */
const nominatimAddressToAddressData = (
  nominatimAddress: NominatimAddress
): AddressData => {
  return {
    text: nominatimAddress.display_name,
    position: { lat: nominatimAddress.lat, lng: nominatimAddress.lon },
  } as AddressData;
};

/** Peforms a geocode request to nominatim api and returns the results mapped to AddressData
 * 
 * @param address: address to geocode
 * @returns: an array containing all addresses related to the seach parameter
 */
const searchAddress = async (address: string): Promise<AddressData[]> => {
  const searchParams = new URLSearchParams({
    q: address,
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
      console.log(response);
      throw new Error(
        `Content type not supported - ${JSON.stringify(response)}`
      );
    }

    const responseBody = (await response.json()) as NominatimAddress[];

    const addresses = responseBody.map(nominatimAddressToAddressData);
    return addresses;
  } catch (error) {
    console.log(error);
  }

  // return empty if there was an error
  return [];
};

/** Returns the url for opensteetmaps tiles api
 * 
 * @returns string url
 */
const getMapTilesUrl = async () => {
  return `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;
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
