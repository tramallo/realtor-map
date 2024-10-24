export interface AddressData {
    text: string;
    position: { lat: number; lng: number };
}

export interface GeocodingService {
    searchAddress: (address: string) => Promise<AddressData[]>;
    attribution: React.ReactElement
}

export interface MapTilesService {
    getMapTilesUrl: () => Promise<string>;
    attribution: string
}