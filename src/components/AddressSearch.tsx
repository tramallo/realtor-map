import "./AddressSearch.css";
import SearchBar from "./SearchBar";

export interface AddressData {
  text: string;
  position: { lat: number; lng: number };
}
export interface GeocodingProvider<R> {
  searchAddress: (address: string) => Promise<R[]>;
  resultToAddressData: (searchResult: R) => AddressData;
  attribute: {
    text: string;
    url: string;
  };
}
export interface AddressSearchProps<T> {
  onAddressFound: (address: AddressData) => void;
  geocodingService: GeocodingProvider<T>;
}

export default function AddressSearch<T>({
  geocodingService,
  onAddressFound,
}: AddressSearchProps<T>) {
  const handleOnSearch = async (searchValue: string) => {
    const addresses = await geocodingService.searchAddress(searchValue);
    const mappedAddresses = addresses.map(geocodingService.resultToAddressData);

    // return first address when just 1 is found
    if (mappedAddresses.length == 1) {
      onAddressFound(mappedAddresses[0]);
      return;
    }

    // let user select the address of interest when more than 1 is found
    if (mappedAddresses.length) {
      // select value code
      console.log(
        "multiple addresses match your search, select the one you looking for"
      );
      console.log(mappedAddresses);
      return;
    }

    // show no results for search
    console.log("no address found, please check your search parameter");
  };

  return (
    <div className="address-search">
      <span>
        <a href={geocodingService.attribute.url} target="_blank">
          {geocodingService.attribute.text}
        </a>
      </span>
      <SearchBar onSearch={handleOnSearch} />
    </div>
  );
}
