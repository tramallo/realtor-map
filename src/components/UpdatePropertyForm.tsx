import { useForm } from "react-hook-form";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProperty>({
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
    <form className="update-property-form">
      {!propertyToUpdate && <span>Property not found</span>}
      {propertyToUpdate && (
        <div className="update-property-form-fields">
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
          <FormSelectField
            registration={register("ownerId")}
            validationError={errors.ownerId}
            label="Owner id"
            options={persons.map((person) => ({
              label: `${person.name} - ${person.mobile ?? ""} - ${
                person.email ?? ""
              }`,
              value: person.id,
            }))}
            addEmptyOption
          />
          <FormTextArea
            registration={register("description")}
            validationError={errors.description}
          />
          <FormTextField
            registration={register("updatedBy")}
            validationError={errors.updatedBy}
            label="Updated by"
            value="pedriño"
            readOnly
          />
          <FormDateField
            registration={register("updatedAt")}
            validationError={errors.updatedAt}
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
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Update
        </button>
      </div>
    </form>
  );
}
