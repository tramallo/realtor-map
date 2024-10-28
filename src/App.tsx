import { Marker, Popup } from "react-leaflet";
import { useState } from "react";

import "./App.css";
import SearchMap from "./components/SearchMap";
import Modal from "./components/Modal";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { getIconForProperty } from "./utils/mapMarkerIcons";
import CreatePropertyForm from "./components/CreatePropertyForm";
import { CreateProperty } from "./utils/domainSchemas";
import { usePropertyStore } from "./utils/domainDataStore";
import { AddressData } from "./utils/mapServicesSchemas";

export default function App() {
  const properties = usePropertyStore((store) => store.properties);
  const createProperty = usePropertyStore((store) => store.createProperty);

  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);

  const closeModal = () => {
    setModal(undefined);
  };

  const handleNewPropertySubmit = (property: CreateProperty) => {
    const error = createProperty(property);

    if (!error) {
      closeModal();
      return;
    }

    //show error on ui
    console.log(error);
  };

  const openCreatePropertyModal = (address: AddressData) => {
    const prefillAddress: Partial<CreateProperty> = {
      address: address.text,
      coordinates: { lat: address.position.lat, lng: address.position.lng },
    };

    const createPropertyModal = (
      <Modal title="New property">
        <CreatePropertyForm
          onSubmit={handleNewPropertySubmit}
          onCancel={closeModal}
          prefillData={prefillAddress}
        />
      </Modal>
    );

    setModal(createPropertyModal);
  };

  return (
    <div id="app">
      <span>
        controls area{" "}
        <button onClick={() => console.log("lcick")}>new property</button>
      </span>
      <SearchMap
        geocodingService={googleGeocodingService}
        mapTilesService={osmMapTilesService}
        onAddressClick={openCreatePropertyModal}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={property.coordinates}
            icon={getIconForProperty(property)}
          >
            <Popup>
              {property.id}: {property.address}
            </Popup>
          </Marker>
        ))}
      </SearchMap>
      {modal && modal}
    </div>
  );
}
