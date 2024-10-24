import { useEffect, useState } from "react";

import "./App.css";
import Map, { MarkerData } from "./components/Map";
import AddressSearch from "./components/AddressSearch";
import { AddressData } from "./utils/mapServicesSchemas";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { useDomainData } from "./components/DomainDataContext";
import { Property } from "./utils/domainSchemas";

export default function App() {
  const [markers, setMarkers] = useState([] as MarkerData[]);
  const { properties, setProperties } = useDomainData();

  const handleAddressFound = async (addressData: AddressData) => {
    /* const markerFromAddress: MarkerData = {
      text: addressData.text,
      position: addressData.position,
    };

    setMarkers((prevMarkers) => [...prevMarkers, markerFromAddress]); */
    const newProperty: Property = {
      address: addressData.text,
      type: "house",
      coordinates: addressData.position,
    };

    setProperties((prevProperties) => [...prevProperties, newProperty]);
  };

  useEffect(() => {
    console.log(properties);
  }, [properties]);

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
