const apiUrl = "https://nominatim.openstreetmap.org/search";

// not all values will be present, that depends on the request
export interface AddressSchema {
    place_id: number, 
    licence: string,
    osm_type: string,
    osm_id: number,
    boundingbox: [
        number, //lat_min 
        number, //lat_max
        number, //lon_min
        number  //lon_max
    ],
    lat: number,
    lon: number,
    display_name: string, // human-readable name of the location
    class: string, // general classification ex: place|address|road|city|country
    type: string, // specific type of place ex: city|town|village|street|country
    importance: number, // importance of the result assigned by nominatim
    icon: string, // url of place icon
    address: {
      city: string,
      state_district: string,
      state: string,
      'ISO3166-2-lvl4': string, // ex: GB-ENG
      postcode: string, // ex: SW1A 2DU
      country: string,
      country_code: string // 2 letter code for country ex: uy|eu
    },
    extratags: {
      capital: string, // ex: yes
      website: string,
      wikidata: string, // ex: Q84
      wikipedia: string, // ex: en:London
      population: number
    }
}

export const requestAddressInfo = async (address: string): Promise<AddressSchema[]> => {
    const searchParams = new URLSearchParams({
        q: address,
        format: "json"
    }).toString();

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

        const responseBody = await response.json() as AddressSchema[];
        return responseBody;

    } catch (error) {
        console.log(error);
    }

    // return empty if there was an error
    return [];
}