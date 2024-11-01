import { useForm } from "react-hook-form";

import "./CreatePropertyForm.css";
import {
  CreateProperty,
  createPropertySchema,
  getStripAndZodResolver,
  Property,
  propertyStates,
  propertyTypes,
} from "../utils/domainSchemas";
import { usePersonStore, usePropertyStore } from "../utils/domainDataStore";
import FormTextField from "./form/FormTextField";
import FormSelectField from "./form/FormSelectField";
import FormTextArea from "./form/FormTextArea";
import FormDateField from "./form/FormDateField";
import { useModalContext } from "./ModalContext";
import FormCreateSelectPerson from "./form/FormCreateSelectPerson";

export interface CreatePropertyFormProps {
  onCreate?: (newPropertyId: Property["id"]) => void;
  onClose?: () => void;
  prefillData?: Partial<CreateProperty>;
}

export default function CreatePropertyForm({
  onCreate,
  onClose,
  prefillData,
}: CreatePropertyFormProps) {
  const { popModal } = useModalContext();

  const persons = usePersonStore((store) => store.persons);
  const createProperty = usePropertyStore((store) => store.createProperty);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue,
  } = useForm<CreateProperty>({
    resolver: getStripAndZodResolver(createPropertySchema),
    defaultValues: prefillData,
  });

  const onSubmit = async (newPropertyData: CreateProperty) => {
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

  const handleCloseButtonClick = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <form className="create-property-form">
      <div className="create-property-form-fields">
        <FormTextField
          registration={register("address")}
          validationError={errors.address}
        />
        <FormTextField
          registration={register("coordinates.lat")}
          validationError={errors.coordinates?.lat}
          label="Latitude"
        />
        <FormTextField
          registration={register("coordinates.lng")}
          validationError={errors.coordinates?.lng}
          label="Longitude"
        />
        <FormSelectField
          registration={register("type")}
          validationError={errors.type}
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
          addEmptyOption
        />
        <FormSelectField
          registration={register("state")}
          validationError={errors.state}
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
          addEmptyOption
        />
        <FormCreateSelectPerson
          control={control}
          fieldName="ownerId"
          setValue={setValue}
          validationError={errors.ownerId}
          label="Owner"
          emptyValueLabel="..."
        />
        <FormTextArea
          registration={register("description")}
          validationError={errors.description}
        />
        <FormSelectField
          registration={register("createdBy")}
          validationError={errors.createdBy}
          label="Created by"
          options={persons.map((person) => ({
            label: `${person.name} - ${person.mobile ?? ""} - ${
              person.email ?? ""
            }`,
            value: person.id,
          }))}
          defaultOption="maria-id"
          readOnly
        />
        <FormDateField
          registration={register("createdAt")}
          validationError={errors.createdAt}
          label="Created at"
          value={new Date()}
          readOnly
        />
      </div>

      <div className="create-property-form-controls">
        <button type="button" onClick={handleCloseButtonClick}>
          Close
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Create
        </button>
      </div>
    </form>
  );
}
