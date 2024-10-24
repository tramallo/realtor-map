import { useState } from "react";

import "./App.css";
import Map, { MarkerData } from "./components/Map";
import AddressSearch from "./components/AddressSearch";
import { AddressData } from "./utils/mapServicesSchemas";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";

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
      <Map mapTilesService={osmMapTilesService} markers={markers} />
    </div>
  );
}
