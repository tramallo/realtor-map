import { useForm } from "react-hook-form";

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
import SelectField from "./form/SelectField";
import TextArea from "./form/TextArea";
import DateField from "./form/DateField";
import CreateSelectPersonField from "./form/CreateSelectPersonField";
import { useModalContext } from "./ModalContext";

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<UpdatePropertySchema>({
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
      {!propertyToUpdate && <span>Property not found</span>}
      {propertyToUpdate && (
        <div className="update-property-fields">
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
          <TextField
            registration={register("updatedBy")}
            validationError={errors.updatedBy}
            label="Updated by"
            value="pedriño"
            readOnly
          />
          <DateField
            registration={register("updatedAt")}
            validationError={errors.updatedAt}
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
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Update
        </button>
      </div>
    </form>
  );
}
