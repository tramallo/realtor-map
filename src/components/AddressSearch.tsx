import "./AddressSearch.css";
import SearchBar from "./SearchBar";
import { AddressData, GeocodingService } from "../utils/mapServicesSchemas";

export interface AddressSearchProps {
  onAddressFound: (address: AddressData) => void;
  geocodingService: GeocodingService;
}

export default function AddressSearch({
  geocodingService,
  onAddressFound,
}: AddressSearchProps) {
  const handleOnSearch = async (searchValue: string) => {
    const addresses = await geocodingService.searchAddress(searchValue);

    // return first address when just 1 is found
    if (addresses.length == 1) {
      onAddressFound(addresses[0]);
      return;
    }

    // let user select the address of interest when more than 1 is found
    if (addresses.length) {
      // select value code
      console.log(
        "multiple addresses match your search, select the one you looking for"
      );
      console.log(addresses);
      return;
    }

    // show no results for search
    console.log("no address found, please check your search parameter");
  };

  return (
    <div className="address-search">
      <span>{geocodingService.attribution}</span>
      <SearchBar onSearch={handleOnSearch} />
    </div>
  );
}
