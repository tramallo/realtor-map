import { useForm } from "react-hook-form";

import "./CreateProperty.css";
import {
  CreatePropertySchema,
  createPropertySchema,
  getStripAndZodResolver,
  PropertySchema,
  propertyStates,
  propertyTypes,
} from "../utils/domainSchemas";
import { usePersonStore, usePropertyStore } from "../utils/domainDataStore";
import TextField from "./form/TextField";
import SelectField from "./form/SelectField";
import TextArea from "./form/TextArea";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import CreateSelectPersonField from "./form/CreateSelectPersonField";
import CreateSelectRealtorField from "./form/CreateSelectRealtorField";

export interface CreatePropertyProps {
  onCreate?: (newPropertyId: PropertySchema["id"]) => void;
  onClose?: () => void;
  prefillData?: Partial<CreatePropertySchema>;
}

export default function CreateProperty({
  onCreate,
  onClose,
  prefillData,
}: CreatePropertyProps) {
  const { popModal } = useModalContext();

  const persons = usePersonStore((store) => store.persons);
  const createProperty = usePropertyStore((store) => store.createProperty);

  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    setValue,
  } = useForm<CreatePropertySchema>({
    resolver: getStripAndZodResolver(createPropertySchema),
    defaultValues: prefillData,
  });

  const onSubmit = async (newPropertyData: CreatePropertySchema) => {
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
    <form className="create-property">
      <div className="create-property-fields">
        <TextField
          registration={register("address")}
          validationError={errors.address}
        />
        <TextField
          registration={register("coordinates.lat")}
          validationError={errors.coordinates?.lat}
          label="Latitude"
        />
        <TextField
          registration={register("coordinates.lng")}
          validationError={errors.coordinates?.lng}
          label="Longitude"
        />
        <SelectField
          registration={register("type")}
          validationError={errors.type}
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
          addEmptyOption
        />
        <SelectField
          registration={register("state")}
          validationError={errors.state}
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
          addEmptyOption
        />
        <CreateSelectPersonField
          control={control}
          fieldName="ownerId"
          setValue={setValue}
          validationError={errors.ownerId}
          label="Owner"
          emptyValueLabel="..."
        />
        <TextArea
          registration={register("description")}
          validationError={errors.description}
        />
        <CreateSelectRealtorField
          control={control}
          fieldName="exclusive"
          setValue={setValue}
          validationError={errors.exclusive}
          emptyValueLabel="..."
        />
        <SelectField
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
        <DateField
          registration={register("createdAt")}
          validationError={errors.createdAt}
          label="Created at"
          value={new Date()}
          readOnly
        />
      </div>

      <div className="create-property-controls">
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
