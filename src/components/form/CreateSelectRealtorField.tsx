import {
  Controller,
  FieldError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import "./CreateSelectRealtorField.css";
import { useModalContext } from "../ModalContext";
import { useRealtorStore } from "../../utils/domainDataStore";
import { RealtorSchema } from "../../utils/domainSchemas";
import Modal from "../Modal";
import CreateRealtor from "../CreateRealtor";

export interface CreateSelectRealtorFieldProps<
  Schema extends FieldValues,
  SchemaField = FieldPath<Schema>
> {
  formData: UseFormReturn<Schema>;
  fieldName: SchemaField;
  label?: string;
  emptyValueLabel?: string;
}

export default function CreateSelectRealtorField<
  Schema extends FieldValues,
  SchemaValue extends FieldPathValue<Schema, FieldPath<Schema>>
>({
  formData,
  fieldName,
  label,
  emptyValueLabel,
}: CreateSelectRealtorFieldProps<Schema>) {
  const { pushModal } = useModalContext();
  const realtors = useRealtorStore((store) => store.realtors);

  const validationError = formData.formState.errors[fieldName] as
    | FieldError
    | undefined;

  const handleNewRealtor = (newRaltorId: RealtorSchema["id"]) => {
    formData.setValue(fieldName, newRaltorId as SchemaValue);
  };

  const openCreateRealtorModal = () => {
    const createRealtorModal = (
      <Modal title="Create realtor">
        <CreateRealtor onCreate={handleNewRealtor} />
      </Modal>
    );

    pushModal(createRealtorModal);
  };

  return (
    <div className="create-select-realtor-field">
      <label>{label ?? fieldName}</label>
      <Controller
        name={fieldName}
        control={formData.control}
        render={({ field }) => (
          <select {...field}>
            {emptyValueLabel && <option value="">{emptyValueLabel}</option>}
            {realtors.map((realtor) => (
              <option key={realtor.id} value={realtor.id}>
                {realtor.name}
              </option>
            ))}
          </select>
        )}
      />

      {validationError && <span>{validationError.message}</span>}
      <button type="button" onClick={openCreateRealtorModal}>
        New Realtor
      </button>
    </div>
  );
}
