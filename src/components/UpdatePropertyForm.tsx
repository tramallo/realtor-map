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
import { usePropertyStore } from "../utils/domainDataStore";
import FormTextField from "./form/FormTextField";
import FormSelectField from "./form/FormSelectField";
import FormTextArea from "./form/FormTextArea";
import FormDateField from "./form/FormDateField";
import FormCreateSelectPerson from "./form/FormCreateSelectPerson";
import { useModalContext } from "./ModalContext";

export interface UpdatePropertyFormProps {
  propertyId: Property["id"];
  onUpdate?: (updatedPropertyId: Property["id"]) => void;
  onClose?: () => void;
}

export default function UpdatePropertyForm({
  propertyId,
  onUpdate,
  onClose,
}: UpdatePropertyFormProps) {
  const { popModal } = useModalContext();
  const updateProperty = usePropertyStore((store) => store.updateProperty);
  const properties = usePropertyStore((store) => store.properties);
  const propertyToUpdate = properties.find(
    (property) => property.id == propertyId
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
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

    if (onUpdate) {
      onUpdate(propertyId);
    }
    popModal();
  };

  const handleCloseButtonClick = () => {
    popModal();
    if (onClose) {
      onClose();
    }
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
        <button type="button" onClick={handleCloseButtonClick}>
          Close
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Update
        </button>
      </div>
    </form>
  );
}
