import { useForm } from "react-hook-form";

import "./UpdatePropertyForm.css";
import {
  customResolver,
  Property,
  propertyStates,
  propertyTypes,
  UpdateProperty,
  updatePropertySchema,
} from "../utils/domainSchemas";
import { usePropertyStore } from "../utils/domainDataStore";

export interface UpdatePropertyFormProps {
  propertyId: Property["id"];
  onClose: () => void;
}

export default function UpdatePropertyForm({
  propertyId,
  onClose,
}: UpdatePropertyFormProps) {
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
    resolver: customResolver(updatePropertySchema),
    defaultValues: propertyToUpdate,
  });

  const onSubmit = async (updatePropertyData: UpdateProperty) => {
    const error = await updateProperty(propertyId, updatePropertyData);
    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    onClose();
  };

  return (
    <form className="update-property-form">
      {!propertyToUpdate && <span>Property not found</span>}
      {propertyToUpdate && (
        <div className="update-property-form-fields">
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
          {errors.owner && <span>{errors.owner?.message}</span>}
          {errors.owner?.name && <span>{errors.owner?.name.message}</span>}
          {errors.owner?.mobile && <span>{errors.owner?.mobile.message}</span>}
          {errors.owner?.email && <span>{errors.owner?.email.message}</span>}
          <label>Description</label>
          <input {...register("description")} />
          {errors.description && <span>{errors.description.message}</span>}
          <label>Created by</label>
          <input {...register("createdBy")} readOnly />
          {errors.createdBy && <span>{errors.createdBy.message}</span>}
          <label>Created at</label>
          <input {...register("createdAt")} readOnly />
          {errors.createdAt && <span>{errors.createdAt.message}</span>}
        </div>
      )}
      <div className="update-property-form-controls">
        <button type="button" onClick={onClose}>
          Cancel
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Submit
        </button>
      </div>
    </form>
  );
}
