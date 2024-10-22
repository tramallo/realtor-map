import { GeocodingProvider } from "../components/AddressSearch";
import { GoogleAddressSchema, searchAddress as googleSearchAddress } from "./googleApi";
import { NominatimAddressSchema, searchAddress as nominatimSearchAddress } from "./nominatimApi";

export const googleGeocodingService: GeocodingProvider<GoogleAddressSchema> = {
    searchAddress: googleSearchAddress,
    resultToAddressData: (searchResult) => ({
        text: searchResult.formatted_address,
        position: {
            lat: searchResult.geometry.location.lat,
            lng: searchResult.geometry.location.lng
        }
    })
}

export const nominatimGeocodingService: GeocodingProvider<NominatimAddressSchema> = {
    searchAddress: nominatimSearchAddress,
    resultToAddressData: (searchResult) => ({
        text: searchResult.display_name,
        position: {
            lat: searchResult.lat,
            lng: searchResult.lon
        }
    })
}