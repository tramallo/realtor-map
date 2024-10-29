import "./ViewProperty.css";
import { usePropertyStore } from "../utils/domainDataStore";
import { Property } from "../utils/domainSchemas";

export interface ViewPropertyProps {
  propertyId: Property["id"];
  onClose: () => void;
  onClickUpdate: (propertyId: Property["id"]) => void;
}

export default function ViewProperty({
  propertyId,
  onClose,
  onClickUpdate,
}: ViewPropertyProps) {
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

    onClose();
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
            Type: <span>{property.type}</span>
          </label>
          <label>
            Coordinates:{" "}
            <span>
              lat {property.coordinates.lat} lng {property.coordinates.lng}
            </span>
          </label>
          <label>
            State: <span>{property.state}</span>
          </label>
          <label>
            Owner:{" "}
            <span>
              {property.owner?.name} ; {property.owner?.mobile} ;{" "}
              {property.owner?.email}
            </span>
          </label>
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
        <button type="button" onClick={onClose}>
          Back
        </button>
        <button type="button" onClick={handleDeleteButtonClick}>
          Delete property
        </button>
        <button type="button" onClick={() => onClickUpdate(propertyId)}>
          Update property
        </button>
      </div>
    </div>
  );
}
