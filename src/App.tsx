import { Marker, Popup } from "react-leaflet";
import { useState } from "react";

import "./App.css";
import SearchMap from "./components/SearchMap";
import Modal from "./components/Modal";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { getIconForProperty } from "./utils/mapMarkerIcons";
import CreatePropertyForm from "./components/CreatePropertyForm";
import { CreateProperty, Property } from "./utils/domainSchemas";
import { usePropertyStore } from "./utils/domainDataStore";
import { AddressData } from "./utils/mapServicesSchemas";
import ViewProperty from "./components/ViewProperty";
import UpdatePropertyForm from "./components/UpdatePropertyForm";

export default function App() {
  const properties = usePropertyStore((store) => store.properties);

  const [modal, setModal] = useState<JSX.Element | undefined>(undefined);

  const closeModal = () => {
    setModal(undefined);
  };

  const openCreatePropertyModal = (address: AddressData) => {
    const prefillAddress: Partial<CreateProperty> = {
      address: address.text,
      coordinates: { lat: address.position.lat, lng: address.position.lng },
    };

    const createPropertyModal = (
      <Modal title="New property">
        <CreatePropertyForm
          onCreate={openViewPropertyModal}
          onClose={closeModal}
          prefillData={prefillAddress}
        />
      </Modal>
    );

    setModal(createPropertyModal);
  };

  const openUpdatePropertyModal = (propertyId: Property["id"]) => {
    const updatePropertyModal = (
      <Modal title="Update property">
        <UpdatePropertyForm
          propertyId={propertyId}
          onUpdate={openViewPropertyModal}
          onClose={closeModal}
        />
      </Modal>
    );

    setModal(updatePropertyModal);
  };

  const openViewPropertyModal = (propertyId: Property["id"]) => {
    const viewPropertyModal = (
      <Modal title="View property">
        <ViewProperty
          propertyId={propertyId}
          onClose={closeModal}
          onClickUpdate={openUpdatePropertyModal}
        />
      </Modal>
    );

    setModal(viewPropertyModal);
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
              <button
                type="button"
                onClick={() => openViewPropertyModal(property.id)}
              >
                Open details
              </button>
            </Popup>
          </Marker>
        ))}
      </SearchMap>
      {modal && modal}
    </div>
  );
}
