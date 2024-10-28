import { Marker, Popup } from "react-leaflet";
import { useState } from "react";

import "./App.css";
import SearchMap from "./components/SearchMap";
import Modal from "./components/Modal";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { useDomainData } from "./components/DomainDataContext";
import { getIconForProperty } from "./utils/mapMarkerIcons";
import PropertyForm from "./components/PropertyForm";
import { Property } from "./utils/domainSchemas";

export default function App() {
  const { properties } = useDomainData();
  const [showNewPropertyModal, setShowNewPropertyModal] = useState(false);

  const toggleNewPropertyModal = () => {
    setShowNewPropertyModal(!showNewPropertyModal);
  };

  const handleNewPropertySubmit = (property: Property) => {
    console.log(property);
  };

  return (
    <div id="app">
      <span>
        controls area{" "}
        <button onClick={toggleNewPropertyModal}>new property</button>
      </span>
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
      {showNewPropertyModal && (
        <Modal title="New property">
          <PropertyForm
            onSubmit={handleNewPropertySubmit}
            onCancel={toggleNewPropertyModal}
          />
        </Modal>
      )}
    </div>
  );
}
