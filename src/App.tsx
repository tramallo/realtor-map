import { useState } from "react";

import "./App.css";
import SearchBar from "./components/SearchBar";
import Map, { MarkerData } from "./components/Map";

export default function App() {
  const [markers, setMakers] = useState([] as MarkerData[]);

  const handleSearch = (searchValue: string) => {
    const newMarker: MarkerData = {
      text: searchValue,
      position: { lat: -31.39, lng: -57.95 },
    };

    setMakers((prevMarkers) => [...prevMarkers, newMarker]);
  };

  return (
    <div id="app">
      <SearchBar onSearch={handleSearch} />
      <Map markers={markers} />
    </div>
  );
}
