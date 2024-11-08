import "./UpdateProperty.css";
import {
  PropertyData,
  propertyStates,
  propertyTypes,
  UpdatePropertyData,
  updatePropertySchema,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";
import TextArea from "./form/TextArea";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import SelectField from "./form/SelectField";
import SelectPersonField from "./form/SelectPersonField";
import SelectRealtorField from "./form/SelectRealtorField";
import Form from "./form/Form";
import RHFMUITextField from "./form/RHFMUITextField";

export interface UpdatePropertyProps {
  propertyId: PropertyData["id"];
  onUpdate?: (updatedPropertyId: PropertyData["id"]) => void;
  onClose?: () => void;
}

export default function UpdateProperty({
  propertyId,
  onUpdate,
  onClose,
}: UpdatePropertyProps) {
  const { popModal } = useModalContext();
  const updateProperty = usePropertyStore((store) => store.updateProperty);
  const properties = usePropertyStore((store) => store.properties);
  const propertyToUpdate = properties.find(
    (property) => property.id == propertyId
  );

  const handleFormSubmit = async (updatePropertyData: UpdatePropertyData) => {
    const { error } = await updateProperty(propertyId, updatePropertyData);
    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
    if (onUpdate) {
      onUpdate(propertyId);
    }
  };

  const handleFormCancel = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="update-property">
      <Form
        schema={updatePropertySchema}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        prefillData={propertyToUpdate}
      >
        <RHFMUITextField fieldName="address" label="Address" />
        <RHFMUITextField
          fieldName="coordinates.lat"
          label="Coordinates"
          placeholder="Latitude"
        />
        <RHFMUITextField fieldName="coordinates.lng" label="Lng" placeholder="Longitude" />
        <SelectField
          fieldName="type"
          label="Type"
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
          emptyOptionLabel="select type"
        />
        <SelectField
          fieldName="state"
          label="State"
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
          emptyOptionLabel="select state"
        />
        <SelectPersonField
          fieldName="ownerId"
          label="Owner"
          emptyPersonLabel="select owner"
          allowCreateNewPerson
        />
        <TextArea fieldName="description" label="Description" />
        <SelectRealtorField
          fieldName="exclusive"
          label="Exclusive realtor"
          emptyRealtorLabel="select ex. realtor"
          allowCreateNewRealtor
        />
        <RHFMUITextField
          fieldName="updatedBy"
          label="Updated by"
          defaultValue="pedriño"
          readOnly
        />
        <DateField
          fieldName="updatedAt"
          label="Updated at"
          defaultValue={new Date()}
          readOnly
        />
      </Form>
    </div>
  );
}
