import { FormProvider, useForm } from "react-hook-form";

import "./CreateProperty.css";
import {
  CreatePropertySchema,
  createPropertySchema,
  getStripAndZodResolver,
  PropertySchema,
  propertyStates,
  propertyTypes,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";
import TextField from "./form/TextField";
import TextArea from "./form/TextArea";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";
import SelectField from "./form/SelectField";
import SelectPersonField from "./form/SelectPersonField";
import SelectRealtorField from "./form/SelectRealtorField";

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

  const createProperty = usePropertyStore((store) => store.createProperty);

  const formData = useForm<CreatePropertySchema>({
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
      <FormProvider {...formData}>
        <div className="create-property-fields">
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
            label="Type"
            options={propertyTypes.map((propertyType) => ({
              label: propertyType,
              value: propertyType,
            }))}
            emptyOptionLabel="..."
          />
          <SelectField
            fieldName="state"
            label="State"
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
            registration={formData.register("createdBy")}
            validationError={formData.formState.errors.createdBy}
            value="maria-id"
            readOnly
          />
          <DateField
            registration={formData.register("createdAt")}
            validationError={formData.formState.errors.createdAt}
            label="Created at"
            value={new Date()}
            readOnly
          />
        </div>

        <div className="create-property-controls">
          <button type="button" onClick={handleCloseButtonClick}>
            Close
          </button>
          <button type="button" onClick={formData.handleSubmit(onSubmit)}>
            Create
          </button>
        </div>
      </FormProvider>
    </form>
  );
}
