const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json`;

export interface GoogleAddressComponentSchema {
    long_name: string,
    short_name: string,
    types: string[] // ex: ['street_number','route','locality','political','administrative_area_level_1', 'country', 'postal_code']
}
export interface GoogleAddressSchema {
    place_id: string, // ex: EjdCcmFzaWwgNTY1LCA1MDAwMCBTYWx0bywgRGVwYXJ0YW1lbnRvIGRlIFNhbHRvLCBVcnVndWF5IjESLwoUChIJ396_RtPCrZURDRzJAC9xa_oQtQQqFAoSCe9JjgzV3K2VETw0li2p6ZS3
    formatted_address: string // ex: Brasil 565, 50000 Salto, Departamento de Salto, Uruguay
    types: string[] // ex: ['street_address']
    geometry: {
        location: {
            lat: number,
            lng: number
        }
    },
    address_components: GoogleAddressComponentSchema[]
}
interface GoogleSearchResultSchema {
    status: string, // ex: "OK"
    results: GoogleAddressSchema[],
}

export const searchAddress = async (address: string): Promise<GoogleAddressSchema[]> => {

    const searchParams = new URLSearchParams({
        address: address,
        key: apiKey
    })

    const searchUrl = `${apiUrl}?${searchParams}`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error(`Reponse non-2XX - ${JSON.stringify(response)}`)
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.log(response);
            throw new Error(`Content type not supported - ${JSON.stringify(response)}`);
        }

        const responseBody = await response.json() as GoogleSearchResultSchema;
        const addresses = responseBody.results;
        return addresses;

    } catch (error) {
        console.log(error);
    }

    // return empty if there was an error
    return [];
}