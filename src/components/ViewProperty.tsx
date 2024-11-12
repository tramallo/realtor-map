import "./ViewProperty.css";
import { usePropertyStore } from "../utils/domainDataStore";
import { PropertyData } from "../utils/domainSchemas";
import ViewPerson from "./ViewPerson";
import { useModalContext } from "./ModalContext";
import Modal from "./Modal";
import UpdateProperty from "./UpdateProperty";
import ViewRealtor from "./ViewRealtor";
import { Button } from "@mui/material";

export interface ViewPropertyProps {
  propertyId: PropertyData["id"];
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
              {property.realtors?.map((realtorId) => (
                <ViewRealtor key={realtorId} realtorId={realtorId} />
              ))}
            </span>
          </label>
          <label>Exclusive:</label>
          {property.exclusive && <ViewRealtor realtorId={property.exclusive} />}
          <label>
            Description: <span>{property.description}</span>
          </label>
        </div>
      )}
      <div className="view-property-controls">
        <Button variant="outlined" onClick={handleCloseButtonClick}>
          Close
        </Button>
        <Button variant="outlined" onClick={handleDeleteButtonClick}>
          Delete property
        </Button>
        <Button variant="contained" onClick={handleUpdateButtonClick}>
          Update property
        </Button>
      </div>
    </div>
  );
}
