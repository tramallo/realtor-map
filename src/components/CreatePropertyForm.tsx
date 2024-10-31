import { FormProvider, useForm } from "react-hook-form";

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

export interface CreatePropertyFormProps {
  onCreate: (newPropertyId: Property["id"]) => void;
  onClose: () => void;
  prefillData?: Partial<CreateProperty>;
}

export default function CreatePropertyForm({
  onCreate,
  onClose,
  prefillData,
}: CreatePropertyFormProps) {
  const persons = usePersonStore((store) => store.persons);

  const createProperty = usePropertyStore((store) => store.createProperty);

  const formMethods = useForm<CreateProperty>({
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

    onCreate(newPropertyId);
  };

  return (
    <FormProvider {...formMethods}>
      <form
        className="create-property-form"
        onSubmit={formMethods.handleSubmit(onSubmit)}
      >
        <div className="create-property-form-fields">
          <FormTextField fieldName="address" />
          <FormTextField fieldName="coordinates.lat" label="Latitude" />
          <FormTextField fieldName="coordinates.lng" label="Longitude" />
          <FormSelectField
            fieldName="type"
            options={propertyTypes}
            addEmptyOption
          />
          <FormSelectField
            fieldName="state"
            options={propertyStates}
            addEmptyOption
          />
          <FormSelectField
            fieldName="ownerId"
            label="Owner id"
            options={persons.map((person) => person.id)}
            addEmptyOption
          />
          <FormTextArea fieldName="description" />
          <FormSelectField
            fieldName="createdBy"
            label="Created by"
            options={persons.map((person) => person.id)}
            defaultOption="maria-id"
            readOnly
          />
          <FormDateField
            fieldName="createdAt"
            label="Created at"
            value={new Date()}
            readOnly
          />
        </div>

        <div className="create-property-form-controls">
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="button" onClick={formMethods.handleSubmit(onSubmit)}>
            Create
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
