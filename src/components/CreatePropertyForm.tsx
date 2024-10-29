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
import { usePropertyStore } from "../utils/domainDataStore";

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
  const createProperty = usePropertyStore((store) => store.createProperty);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

    onCreate(newPropertyId);
  };

  return (
    <form className="create-property-form">
      <div className="create-property-form-fields">
        <label>Address*</label>
        <input {...register("address")} />
        {errors.address && <span>enter an address</span>}
        <label>Coordinates*</label>
        <input
          {...register("coordinates.lat")}
          placeholder="latitude"
          readOnly
        />
        <input
          {...register("coordinates.lng")}
          placeholder="longitude"
          readOnly
        />
        {errors.coordinates && (
          <span>enter latitude & logitude number coordinates</span>
        )}
        <label>Type*</label>
        <select {...register("type")}>
          <option value="">select a type...</option>
          {propertyTypes.map((propertyType, index) => (
            <option key={`propertyType-${index}`} value={propertyType}>
              {propertyType}
            </option>
          ))}
        </select>
        {errors.type && <span>select a type</span>}
        <label>State</label>
        <select {...register("state")}>
          <option value="">select a state...</option>
          {propertyStates.map((propertyState, index) => (
            <option key={`propertyState-${index}`} value={propertyState}>
              {propertyState}
            </option>
          ))}
        </select>
        {errors.state && <span>select a state</span>}
        <label>Owner</label>
        <input {...register("owner.name")} placeholder="name" />
        <input {...register("owner.mobile")} placeholder="mobile" />
        <input {...register("owner.email")} placeholder="email" />
        {errors.owner && <span>{errors.owner.name?.message}</span>}
        <label>Description</label>
        <input {...register("description")} />
        {errors.description && <span>{errors.description.message}</span>}
        <label>Created by</label>
        <input value={"Albert Einstein"} {...register("createdBy")} readOnly />
        {errors.createdBy && <span>{errors.createdBy.message}</span>}
        <label>Created at</label>
        <input
          value={new Date().toISOString()}
          {...register("createdAt")}
          readOnly
        />
        {errors.createdAt && <span>{errors.createdAt.message}</span>}
      </div>

      <div className="create-property-form-controls">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Create
        </button>
      </div>
    </form>
  );
}
