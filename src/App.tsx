import { useState } from "react";

import "./App.css";
import SearchBar from "./components/SearchBar";
import Map, { MarkerData } from "./components/Map";
import { requestAddressInfo } from "./utils/googleApi";

export default function App() {
  const [markers, setMarkers] = useState([] as MarkerData[]);

  const handleSearch = async (searchValue: string) => {
    const addressInfo = await requestAddressInfo(searchValue);

    addressInfo.forEach((address) => {
      const newMarker: MarkerData = {
        text: address.formatted_address,
        position: {
          lat: address.geometry.location.lat,
          lng: address.geometry.location.lng,
        },
      };

      setMarkers((prevMarkers) => [...prevMarkers, newMarker]);
    });
  };

  return (
    <div id="app">
      <SearchBar onSearch={handleSearch} />
      <Map markers={markers} />
    </div>
  );
}
