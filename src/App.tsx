import { useState } from "react";

import "./App.css";
import SearchBar from "./components/SearchBar";
import Map, { MarkerData } from "./components/Map";
import { requestAddressInfo } from "./utils/nominatimApi";

export default function App() {
  const [markers, setMarkers] = useState([] as MarkerData[]);

  const handleSearch = async (searchValue: string) => {
    const addresInfo = await requestAddressInfo(searchValue);

    addresInfo.forEach((address) => {
      const newMarker: MarkerData = {
        text: address.display_name,
        position: { lat: address.lat, lng: address.lon },
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
