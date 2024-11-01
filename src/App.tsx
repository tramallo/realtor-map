import { Marker, Popup } from "react-leaflet";

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
import CreatePersonForm from "./components/CreatePersonForm";
import { useModalContext } from "./components/ModalContext";

export default function App() {
  const { pushModal } = useModalContext();
  const properties = usePropertyStore((store) => store.properties);

  const openCreatePropertyModal = (address: AddressData) => {
    const prefillAddress: Partial<CreateProperty> = {
      address: address.text,
      coordinates: { lat: address.position.lat, lng: address.position.lng },
    };

    const createPropertyModal = (
      <Modal title="New property">
        <CreatePropertyForm
          onCreate={openViewPropertyModal}
          prefillData={prefillAddress}
        />
      </Modal>
    );

    pushModal(createPropertyModal);
  };

  const openViewPropertyModal = (propertyId: Property["id"]) => {
    const viewPropertyModal = (
      <Modal title="View property">
        <ViewProperty propertyId={propertyId} />
      </Modal>
    );

    pushModal(viewPropertyModal);
  };

  const openTestModal = () => {
    const testModal = (
      <Modal title="Test">
        <CreatePersonForm onCreate={(personId) => console.log(personId)} />
      </Modal>
    );

    pushModal(testModal);
  };

  return (
    <div id="app">
      <span>
        controls area <button onClick={openTestModal}>Open test modal</button>
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
    </div>
  );
}
