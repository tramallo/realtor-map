import { ReactNode, useRef, useState } from "react";
import {
  AddressData,
  GeocodingService,
  MapTilesService,
} from "../utils/mapServicesSchemas";
import { Popup as LeafletPopup } from "leaflet";
import { Marker, Popup } from "react-leaflet";

import "./SearchMap.css";
import SearchBar from "./SearchBar";
import Map from "./Map";
import { searchMarkerIcon } from "../utils/mapMarkerIcons";

export interface SearchMapProps {
  geocodingService: GeocodingService;
  mapTilesService: MapTilesService;
  onAddressClick?: (address: AddressData) => void;
  children?: ReactNode;
}

export default function SearchMap({
  mapTilesService,
  geocodingService,
  onAddressClick,
  children,
}: SearchMapProps) {
  const [searchAddresses, setSearchAddresses] = useState([] as AddressData[]);
  const openedPopup = useRef(null as LeafletPopup | null);

  const handleSearchBarOnSearch = async (searchValue: string) => {
    const addresses = await geocodingService.searchAddress(searchValue);

    if (!addresses.length) {
      console.log("no address found, please check your search word");
      return;
    }

    setSearchAddresses(addresses);
  };

  const handleSearchBarOnClear = () => {
    setSearchAddresses([]);
  };

  return (
    <div className="search-map">
      <span>{geocodingService.attribution}</span>
      <SearchBar
        onSearch={handleSearchBarOnSearch}
        onClear={handleSearchBarOnClear}
      />
      <Map mapTilesService={mapTilesService}>
        {children}
        {searchAddresses.map((address, index) => (
          <Marker
            eventHandlers={{
              popupopen: (e) => (openedPopup.current = e.popup),
            }}
            key={index}
            position={address.position}
            icon={searchMarkerIcon}
          >
            <Popup>
              {address.text} - {address.position.lat}:{address.position.lng}
              <button
                type="button"
                onClick={
                  onAddressClick
                    ? () => {
                        onAddressClick(address);
                        openedPopup.current?.close();
                      }
                    : undefined
                }
              >
                Create property
              </button>
            </Popup>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
