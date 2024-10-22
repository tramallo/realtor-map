import { useState } from "react";

import "./App.css";
import Map, { MarkerData } from "./components/Map";
import AddressSearch, { AddressData } from "./components/AddressSearch";
import { googleGeocodingService } from "./utils/geocodingProviders";

export default function App() {
  const [markers, setMarkers] = useState([] as MarkerData[]);

  const handleAddressFound = async (addressData: AddressData) => {
    const markerFromAddress: MarkerData = {
      text: addressData.text,
      position: addressData.position,
    };

    setMarkers((prevMarkers) => [...prevMarkers, markerFromAddress]);
  };

  return (
    <div id="app">
      <AddressSearch
        geocodingService={googleGeocodingService}
        onAddressFound={handleAddressFound}
      />
      <Map markers={markers} />
    </div>
  );
}
