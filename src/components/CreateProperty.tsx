import {
  CreatePropertyData,
  CreatePropertySchema,
  createPropertySchema,
  PropertyData,
  propertyStates,
  propertyTypes,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import SelectField from "./form/SelectField";
import SelectPersonField from "./form/SelectPersonField";
import SelectRealtorField from "./form/SelectRealtorField";
import Form from "./form/Form";
import MuiTextField from "./form/MuiTextField";

export interface CreatePropertyProps {
  onCreate?: (newPropertyId: PropertyData["id"]) => void;
  onClose?: () => void;
  prefillData?: Partial<CreatePropertySchema>;
}

export default function CreateProperty({
  onCreate,
  onClose,
  prefillData,
}: CreatePropertyProps) {
  const { popModal } = useModalContext();
  const createProperty = usePropertyStore((store) => store.createProperty);

  const handleFormSubmit = async (newPropertyData: CreatePropertyData) => {
    const { error, data: newPropertyId } = await createProperty(
      newPropertyData
    );
    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
    if (onCreate) {
      onCreate(newPropertyId);
    }
  };

  const handleFormCancel = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form<CreatePropertySchema>
      schema={createPropertySchema}
      onSubmit={handleFormSubmit}
      onCancel={handleFormCancel}
      prefillData={prefillData}
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
        emptyOptionLabel="select a type"
      />
      <SelectField
        fieldName="state"
        label="State"
        options={propertyStates.map((propertyState) => ({
          label: propertyState,
          value: propertyState,
        }))}
        emptyOptionLabel="select a state"
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
      <SelectRealtorField
        fieldName="realtors"
        label="Associated realtors"
        multiple
        allowCreateNewRealtor
      />
      <MuiTextField
        fieldName="createdBy"
        label="Created by"
        defaultValue="maria-id"
        readOnly
      />
      <DateField
        fieldName="createdAt"
        label="Created at"
        defaultValue={new Date()}
        readOnly
      />
    </Form>
  );
}
