import { Marker, Popup } from "react-leaflet";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";

import "./App.css";
import SearchMap from "./components/SearchMap";
import Modal from "./components/Modal";
import { googleGeocodingService } from "./utils/googleApi";
import { osmMapTilesService } from "./utils/nominatimOSMApi";
import { getIconForProperty } from "./utils/mapMarkerIcons";
import CreateProperty from "./components/CreateProperty";
import { CreatePropertySchema, PropertySchema } from "./utils/domainSchemas";
import { usePropertyStore } from "./utils/domainDataStore";
import { AddressData } from "./utils/mapServicesSchemas";
import ViewProperty from "./components/ViewProperty";
import CreatePerson from "./components/CreatePerson";
import { useModalContext } from "./components/ModalContext";

export default function App() {
  const { pushModal } = useModalContext();
  const properties = usePropertyStore((store) => store.properties);

  const openCreatePropertyModal = (address: AddressData) => {
    const prefillAddress: Partial<CreatePropertySchema> = {
      address: address.text,
      coordinates: { lat: address.position.lat, lng: address.position.lng },
    };

    const createPropertyModal = (
      <Modal title="New property">
        <CreateProperty
          onCreate={openViewPropertyModal}
          prefillData={prefillAddress}
        />
      </Modal>
    );

    pushModal(createPropertyModal);
  };

  const openViewPropertyModal = (propertyId: PropertySchema["id"]) => {
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
        <CreatePerson onCreate={(personId) => console.log(personId)} />
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
