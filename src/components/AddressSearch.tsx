import { ReactNode, useState } from "react";
import {
  AddressData,
  GeocodingService,
  MapTilesService,
} from "../utils/mapServicesSchemas";
import { Marker, Popup } from "react-leaflet";

import "./AddressSearch.css";
import SearchBar from "./SearchBar";
import Map from "./Map";

export interface AddressSearchProps {
  geocodingService: GeocodingService;
  mapTilesService: MapTilesService;
  children?: ReactNode;
}

export default function AddressSearch({
  mapTilesService,
  geocodingService,
  children,
}: AddressSearchProps) {
  const [searchAddresses, setSearchAddresses] = useState([] as AddressData[]);

  const handleOnSearch = async (searchValue: string) => {
    const addresses = await geocodingService.searchAddress(searchValue);

    if (!addresses.length) {
      console.log("no address found, please check your search word");
      return;
    }

    setSearchAddresses(addresses);
  };

  return (
    <div className="address-search">
      <span>{geocodingService.attribution}</span>
      <SearchBar onSearch={handleOnSearch} />
      <Map mapTilesService={mapTilesService}>
        {children}
        {searchAddresses.map((address, index) => (
          <Marker key={index} position={address.position}>
            <Popup>{address.text}</Popup>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
