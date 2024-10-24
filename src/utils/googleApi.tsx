import {
  AddressData,
  GeocodingService,
  MapTilesService,
} from "./mapServicesSchemas";

// GEOCODING SERVCE
const geocodingApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const geocodingApiUrl = `https://maps.googleapis.com/maps/api/geocode/json`;

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

// MAP TILES SERVICE
const mapTilesApiKey = import.meta.env.VITE_GOOGLE_MAPS_TILES_API_KEY;

// session token
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
const isMapTilesSessionTokenValid = (): boolean => {
  const token = retrieveMapTilesSessionToken();
  if (!token) {
    return false;
  }

  const isValid = Date.now() < token.expiration;
  return isValid;
};
interface CreateMapTilesSessionResponse {
  expiry: number; // expiration time of the token (seconds since epoch)
  session: string; //token value
  tileHeight: number;
  tileWidth: number;
  imageFormat: string; // tile image format ex: "png"
}
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

const getMapTilesUrl = async (): Promise<string> => {
  if (!isMapTilesSessionTokenValid()) {
    await createMapTilesSession();
  }

  const sessionToken = retrieveMapTilesSessionToken()!;
  return `https://tile.googleapis.com/v1/2dtiles/{z}/{x}/{y}?session=${sessionToken.value}&key=${mapTilesApiKey}`;
};

// EXPORTS
export const googleGeocodingService: GeocodingService = {
  searchAddress: searchAddress,
  attribution: (
    <span>
      Search results powered by{" "}
      <a href="https://policies.google.com/terms">Google</a>
    </span>
  ),
};

export const googleMapTilesService: MapTilesService = {
  getMapTilesUrl: getMapTilesUrl,
  attribution: `Map data powered by <a href="https://policies.google.com/terms">Google</a>`,
};
