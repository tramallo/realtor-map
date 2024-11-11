import {
  PropertyData,
  propertyStates,
  propertyTypes,
  UpdatePropertyData,
  updatePropertySchema,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import SelectField from "./form/SelectField";
import SelectPersonField from "./form/SelectPersonField";
import SelectRealtorField from "./form/SelectRealtorField";
import Form from "./form/Form";
import MuiTextField from "./form/MuiTextField";

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
      <Form
        schema={updatePropertySchema}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        prefillData={propertyToUpdate}
      >
        <MuiTextField fieldName="address" label="Address" />
        <MuiTextField
          fieldName="coordinates.lat"
          label="Latitude"
          placeholder="Latitude"
        />
        <MuiTextField
          fieldName="coordinates.lng"
          label="Longitude"
          placeholder="Longitude"
        />
        <SelectField
          fieldName="type"
          label="Type"
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
        />
        <SelectField
          fieldName="state"
          label="State"
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
        />
        <SelectPersonField
          fieldName="ownerId"
          label="Owner"
          allowCreateNewPerson
        />
        <MuiTextField fieldName="description" label="Description" multiline />
        <SelectRealtorField
          fieldName="exclusive"
          label="Exclusive realtor"
          allowCreateNewRealtor
        />
        <MuiTextField
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
  );
}
