import { createElement } from "react";

import {
  Location,
  GeocodingService,
  MapTilesService,
} from "../utils/services-interface";
import { OperationResponse } from "../utils/helperFunctions";

const geocodingApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json`;

// GEOCODING
interface GoogleLocationComponent {
  long_name: string;
  short_name: string;
  types: string[]; // ex: ['street_number','route','locality','political','administrative_area_level_1', 'country', 'postal_code']
}
interface GoogleLocation {
  place_id: string; // ex: EjdCcmFzaWwgNTY1LCA1MDAwMCBTYWx0bywgRGVwYXJ0YW1lbnRvIGRlIFNhbHRvLCBVcnVndWF5IjESLwoUChIJ396_RtPCrZURDRzJAC9xa_oQtQQqFAoSCe9JjgzV3K2VETw0li2p6ZS3
  formatted_address: string; // ex: Brasil 565, 50000 Salto, Departamento de Salto, Uruguay
  types: string[]; // ex: ['street_address']
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: GoogleLocationComponent[];
}
interface GoogleAddressSearchResponse {
  status: string; // ex: "OK"
  results: GoogleLocation[];
}

const googleLocationToLocation = (
  googleLocation: GoogleLocation
): Location => {
  return {
    address: googleLocation.formatted_address,
    coordinates: {
      lat: googleLocation.geometry.location.lat,
      lng: googleLocation.geometry.location.lng,
    },
  } as Location;
};

const searchAddress = async (searchValue: string): Promise<OperationResponse<Location[]>> => {
  return { data: [{ address: 'liber seregni 2401', coordinates: { lat: -31.3641713, lng: -57.95752539999999 } }] }

  const searchParams = new URLSearchParams({
    address: searchValue,
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
    const googleLocations = responseBody.results;

    const locations = googleLocations.map(googleLocationToLocation);
    return { data: locations};
  } catch (error) {
    return { error: error as Error }
  }
};

// MAP TILES
const mapTilesApiKey = import.meta.env.VITE_GOOGLE_MAPS_TILES_API_KEY;

const createMapTilesSessionUrl = `https://tile.googleapis.com/v1/createSession?key=${mapTilesApiKey}`;
const mapTilesSessionTokenName = "mapTilesSessionToken";

interface MapTilesSessionToken {
  expiration: number;
  value: string;
}

const storeMapTilesSessionToken = (newToken: MapTilesSessionToken) => {
  localStorage.setItem(mapTilesSessionTokenName, JSON.stringify(newToken));
};
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
const createMapTilesSession = async (): Promise<OperationResponse> => {
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
    return { data: undefined };
  } catch (error) {
    return { error: error as Error };
  }
};

/** Returns the google MapTiles api url, creates a new session for the api when there's no valid session already
 * 
 * @returns: url string
 */
const getMapTilesUrl = async (): Promise<OperationResponse<string>> => {
  if (!isMapTilesSessionTokenValid()) {
    const { error } = await createMapTilesSession();
    if (error) {
      return { error };
    }
  }

  const sessionToken = retrieveMapTilesSessionToken();
  if (!sessionToken) {
    return { error: new Error("Map tiles session token not found") }
  }

  return { data: `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken.value}&key=${mapTilesApiKey}`};
};

// EXPORTS
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
