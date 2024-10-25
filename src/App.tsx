import { Marker, Popup } from "react-leaflet";

import "./App.css";
import SearchMap from "./components/SearchMap";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { useDomainData } from "./components/DomainDataContext";
import { useEffect } from "react";
import { testProperties } from "./utils/testData";
import { getIconForProperty } from "./utils/mapMarkerIcons";

export default function App() {
  const { properties, setProperties } = useDomainData();

  useEffect(() => {
    setProperties(testProperties);
  }, [setProperties]);

  return (
    <div id="app">
      <span>controls area</span>
      <SearchMap
        geocodingService={googleGeocodingService}
        mapTilesService={osmMapTilesService}
      >
        {properties.map((property, index) => (
          <Marker
            key={index}
            position={property.coordinates}
            icon={getIconForProperty(property)}
          >
            <Popup>{property.address}</Popup>
          </Marker>
        ))}
      </SearchMap>
    </div>
  );
}
