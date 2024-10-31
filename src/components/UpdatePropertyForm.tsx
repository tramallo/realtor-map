import { FormProvider, useForm } from "react-hook-form";

import "./UpdatePropertyForm.css";
import {
  getStripAndZodResolver,
  Property,
  propertyStates,
  propertyTypes,
  UpdateProperty,
  updatePropertySchema,
} from "../utils/domainSchemas";
import { usePersonStore, usePropertyStore } from "../utils/domainDataStore";
import FormTextField from "./form/FormTextField";
import FormSelectField from "./form/FormSelectField";
import FormTextArea from "./form/FormTextArea";
import FormDateField from "./form/FormDateField";

export interface UpdatePropertyFormProps {
  propertyId: Property["id"];
  onUpdate: (updatedPropertyId: Property["id"]) => void;
  onClose: () => void;
}

export default function UpdatePropertyForm({
  propertyId,
  onUpdate,
  onClose,
}: UpdatePropertyFormProps) {
  const persons = usePersonStore((store) => store.persons);

  const updateProperty = usePropertyStore((store) => store.updateProperty);
  const properties = usePropertyStore((store) => store.properties);
  const propertyToUpdate = properties.find(
    (property) => property.id == propertyId
  );

  const formMethods = useForm<UpdateProperty>({
    resolver: getStripAndZodResolver(updatePropertySchema),
    defaultValues: propertyToUpdate,
  });

  const onSubmit = async (updatePropertyData: UpdateProperty) => {
    const { error } = await updateProperty(propertyId, updatePropertyData);
    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    onUpdate(propertyId);
  };

  return (
    <FormProvider {...formMethods}>
      <form className="update-property-form">
        {!propertyToUpdate && <span>Property not found</span>}
        {propertyToUpdate && (
          <div className="update-property-form-fields">
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
            <FormTextField
              fieldName="updatedBy"
              label="Updated by"
              value="pedriño"
              readOnly
            />
            <FormDateField
              fieldName="updatedAt"
              label="Updated at"
              value={new Date()}
              readOnly
            />
          </div>
        )}
        <div className="update-property-form-controls">
          <button type="button" onClick={onClose}>
            Close
          </button>
          <button type="button" onClick={formMethods.handleSubmit(onSubmit)}>
            Update
          </button>
        </div>
      </form>
    </FormProvider>
  );
}
