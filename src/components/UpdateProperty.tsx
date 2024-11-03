import { FormProvider, useForm } from "react-hook-form";

import "./UpdateProperty.css";
import {
  getStripAndZodResolver,
  PropertySchema,
  propertyStates,
  propertyTypes,
  UpdatePropertySchema,
  updatePropertySchema,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";
import TextField from "./form/TextField";
import TextArea from "./form/TextArea";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import SelectField from "./form/SelectField";
import SelectPersonField from "./form/SelectPersonField";
import SelectRealtorField from "./form/SelectRealtorField";

export interface UpdatePropertyProps {
  propertyId: PropertySchema["id"];
  onUpdate?: (updatedPropertyId: PropertySchema["id"]) => void;
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

  const formData = useForm<UpdatePropertySchema>({
    resolver: getStripAndZodResolver(updatePropertySchema),
    defaultValues: propertyToUpdate,
  });

  const onSubmit = async (updatePropertyData: UpdatePropertySchema) => {
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
    <form className="update-property">
      <FormProvider {...formData}>
        {!propertyToUpdate && <span>Property not found</span>}
        {propertyToUpdate && (
          <div className="update-property-fields">
            <TextField
              registration={formData.register("address")}
              validationError={formData.formState.errors.address}
            />
            <TextField
              registration={formData.register("coordinates.lat")}
              validationError={formData.formState.errors.coordinates?.lat}
              label="Latitude"
            />
            <TextField
              registration={formData.register("coordinates.lng")}
              validationError={formData.formState.errors.coordinates?.lng}
              label="Longitude"
            />
            <SelectField
              fieldName="type"
              options={propertyTypes.map((propertyType) => ({
                label: propertyType,
                value: propertyType,
              }))}
              emptyOptionLabel="..."
            />
            <SelectField
              fieldName="state"
              options={propertyStates.map((propertyState) => ({
                label: propertyState,
                value: propertyState,
              }))}
              emptyOptionLabel="..."
            />
            <SelectPersonField
              fieldName="ownerId"
              label="Owner"
              emptyPersonLabel="..."
              allowCreateNewPerson
            />
            <TextArea
              registration={formData.register("description")}
              validationError={formData.formState.errors.description}
            />
            <SelectRealtorField
              fieldName="exclusive"
              label="Exclusive realtor"
              emptyRealtorLabel="..."
              allowCreateNewRealtor
            />
            <TextField
              registration={formData.register("updatedBy")}
              validationError={formData.formState.errors.updatedBy}
              label="Updated by"
              value="pedriño"
              readOnly
            />
            <DateField
              registration={formData.register("updatedAt")}
              validationError={formData.formState.errors.updatedAt}
              label="Updated at"
              value={new Date()}
              readOnly
            />
          </div>
        )}
        <div className="update-property-controls">
          <button type="button" onClick={handleCloseButtonClick}>
            Close
          </button>
          <button type="button" onClick={formData.handleSubmit(onSubmit)}>
            Update
          </button>
        </div>
      </FormProvider>
    </form>
  );
}
