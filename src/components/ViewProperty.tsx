import "./ViewProperty.css";
import { usePropertyStore } from "../utils/domainDataStore";
import { PropertySchema } from "../utils/domainSchemas";
import ViewPerson from "./ViewPerson";
import { useModalContext } from "./ModalContext";
import Modal from "./Modal";
import UpdateProperty from "./UpdateProperty";

export interface ViewPropertyProps {
  propertyId: PropertySchema["id"];
  onClose?: () => void;
}

export default function ViewProperty({
  propertyId,
  onClose,
}: ViewPropertyProps) {
  const { popModal, pushModal } = useModalContext();

  const removeProperty = usePropertyStore((store) => store.removeProperty);
  const properties = usePropertyStore((store) => store.properties);
  const property = properties.find((property) => property.id == propertyId);

  const handleDeleteButtonClick = async () => {
    const { error } = await removeProperty(propertyId);

    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
  };

  const handleUpdateButtonClick = () => {
    const updatePropertyModal = (
      <Modal title="Update property">
        <UpdateProperty propertyId={propertyId} />
      </Modal>
    );

    pushModal(updatePropertyModal);
  };

  const handleCloseButtonClick = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="view-property">
      {!property && <span>Property not found</span>}
      {property && (
        <div className="view-property-content">
          <label>
            Address: <span>{property.address}</span>
          </label>
          <label>
            Coordinates:{" "}
            <span>
              lat {property.coordinates.lat} lng {property.coordinates.lng}
            </span>
          </label>
          <label>
            Type: <span>{property.type}</span>
          </label>
          <label>
            State: <span>{property.state}</span>
          </label>
          <label>Owner: </label>
          {property.ownerId && <ViewPerson personId={property.ownerId} />}
          <label>
            Realtors:{" "}
            <span>
              {property.realtors?.map((realtor) => realtor.name).join(" ; ")}
            </span>
          </label>
          <label>
            Exclusive: <span>{property.exclusive?.name}</span>
          </label>
          <label>
            Description: <span>{property.description}</span>
          </label>
        </div>
      )}
      <div className="view-property-controls">
        <button type="button" onClick={handleCloseButtonClick}>
          Close
        </button>
        <button type="button" onClick={handleDeleteButtonClick}>
          Delete property
        </button>
        <button type="button" onClick={handleUpdateButtonClick}>
          Update property
        </button>
      </div>
    </div>
  );
}
