import { GeocodingProvider } from "../components/AddressSearch";
import { GoogleAddressSchema, searchAddress as googleSearchAddress } from "./googleApi";
import { NominatimAddressSchema, searchAddress as nominatimSearchAddress } from "./nominatimOSMApi";

export const googleGeocodingService: GeocodingProvider<GoogleAddressSchema> = {
    searchAddress: googleSearchAddress,
    resultToAddressData: (searchResult) => ({
        text: searchResult.formatted_address,
        position: {
            lat: searchResult.geometry.location.lat,
            lng: searchResult.geometry.location.lng
        }
    }),
    attribute: {
        text: "Search results powered by Google",
        url: "https://maps.google.com"
    }
}

export const nominatimGeocodingService: GeocodingProvider<NominatimAddressSchema> = {
    searchAddress: nominatimSearchAddress,
    resultToAddressData: (searchResult) => ({
        text: searchResult.display_name,
        position: {
            lat: searchResult.lat,
            lng: searchResult.lon
        }
    }),
    attribute: {
        text: "Search results powered by Nominatim",
        url: "https://nominatim.org"
    }
}