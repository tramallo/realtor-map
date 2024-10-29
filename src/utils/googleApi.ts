/** This file exposes a Geocoding & a MapTiles services provided by google cloud
 * 
 * google MapTiles api requires a session to request tiles, so if there's no session,
 * a new session must be created when consumers require the mapTilesUrl
 */
import { createElement } from "react";

import {
  AddressData,
  GeocodingService,
  MapTilesService,
} from "./mapServicesSchemas";

const geocodingApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json`;

/** Following interfaces describes google geocoding responses
 */
interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[]; // ex: ['street_number','route','locality','political','administrative_area_level_1', 'country', 'postal_code']
}
interface GoogleAddress {
  place_id: string; // ex: EjdCcmFzaWwgNTY1LCA1MDAwMCBTYWx0bywgRGVwYXJ0YW1lbnRvIGRlIFNhbHRvLCBVcnVndWF5IjESLwoUChIJ396_RtPCrZURDRzJAC9xa_oQtQQqFAoSCe9JjgzV3K2VETw0li2p6ZS3
  formatted_address: string; // ex: Brasil 565, 50000 Salto, Departamento de Salto, Uruguay
  types: string[]; // ex: ['street_address']
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: GoogleAddressComponent[];
}
interface GoogleAddressSearchResponse {
  status: string; // ex: "OK"
  results: GoogleAddress[];
}

/** Converts address object returned by google api to a local type AddressData
 * 
 * @param googleAddress: address object returned by google
 * @returns: AddressData object
 */
const googleAddressToAddressData = (
  googleAddress: GoogleAddress
): AddressData => {
  return {
    text: googleAddress.formatted_address,
    position: {
      lat: googleAddress.geometry.location.lat,
      lng: googleAddress.geometry.location.lng,
    },
  } as AddressData;
};

/** Performs a geocoding request to google geocoding service and returns the results mapped to AddressData
 * 
 * @param address: address to geocode
 * @returns: an array containing all addresses related to the seach parameter
 */
const searchAddress = async (address: string): Promise<AddressData[]> => {
  const searchParams = new URLSearchParams({
    address: address,
    key: geocodingApiKey,
  });

  const searchUrl = `${geocodingApiUrl}?${searchParams}`;

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

    const responseBody = (await response.json()) as GoogleAddressSearchResponse;
    const googleAddresses = responseBody.results;

    const addresses = googleAddresses.map(googleAddressToAddressData);
    return addresses;
  } catch (error) {
    console.log(error);
  }

  // return empty if there was an error
  return [];
};

const mapTilesApiKey = import.meta.env.VITE_GOOGLE_MAPS_TILES_API_KEY;

const createMapTilesSessionUrl = `https://tile.googleapis.com/v1/createSession?key=${mapTilesApiKey}`;
const mapTilesSessionTokenName = "mapTilesSessionToken";

/** Describes the info saved on local storage for the session token 
 */
interface MapTilesSessionToken {
  expiration: number;
  value: string;
}

/** Saves a session token on local storage
 * 
 * @param newToken: Token value & expiration date to save
 */
const storeMapTilesSessionToken = (newToken: MapTilesSessionToken) => {
  localStorage.setItem(mapTilesSessionTokenName, JSON.stringify(newToken));
};
/** Retrieves the session token saved on local storage
 * 
 * @returns: the token value & expiration date
 */
const retrieveMapTilesSessionToken = (): MapTilesSessionToken | undefined => {
  const tokenString = localStorage.getItem(mapTilesSessionTokenName);

  if (!tokenString) {
    return undefined;
  }
  const token = JSON.parse(tokenString);
  return token;
};

/** Retrieves the saved session token and evaluates expiration date to check validity
 * 
 * @returns true if session still valid
 */
const isMapTilesSessionTokenValid = (): boolean => {
  const token = retrieveMapTilesSessionToken();
  if (!token) {
    return false;
  }

  const isValid = Date.now() < token.expiration;
  return isValid;
};

/** Describes the response from google api when a MapTiles service session is requested
 */
interface CreateMapTilesSessionResponse {
  expiry: number; // expiration time of the token (seconds since epoch)
  session: string; //token value
  tileHeight: number;
  tileWidth: number;
  imageFormat: string; // tile image format ex: "png"
}

/** Performs a request to google MapTiles api to create a new session
 * and stores the session token on local storage
 */
const createMapTilesSession = async () => {
  try {
    const response = await fetch(createMapTilesSessionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mapType: "roadmap",
        language: "en-US",
        region: "US",
      }),
    });

    if (!response.ok) {
      throw new Error(`Reponse status non-2XX - ${JSON.stringify(response)}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error(
        `Content type not supported - ${JSON.stringify(response)}`
      );
    }

    const responseBody =
      (await response.json()) as CreateMapTilesSessionResponse;

    const token: MapTilesSessionToken = {
      expiration: responseBody.expiry,
      value: responseBody.session,
    };
    storeMapTilesSessionToken(token);
  } catch (error) {
    console.log(error);
  }
};

/** Returns the google MapTiles api url, creates a new session for the api when there's no valid session already
 * 
 * @returns: url string
 */
const getMapTilesUrl = async (): Promise<string> => {
  if (!isMapTilesSessionTokenValid()) {
    await createMapTilesSession();
  }

  const sessionToken = retrieveMapTilesSessionToken()!;
  return `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken.value}&key=${mapTilesApiKey}`;
};

// export services
export const googleGeocodingService: GeocodingService = {
  searchAddress: searchAddress,
  attribution: createElement(
    "span",
    null,
    "Search results powered by ",
    createElement("a", { href: "https://policies.google.com/terms" }, "Google")
  ),
};

export const googleMapTilesService: MapTilesService = {
  getMapTilesUrl: getMapTilesUrl,
  attribution: `Map data powered by <a href="https://policies.google.com/terms">Google</a>`,
};
