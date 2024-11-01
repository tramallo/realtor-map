import "./CreateSelectRealtorField.css";
import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { useModalContext } from "../ModalContext";
import { useRealtorStore } from "../../utils/domainDataStore";
import { RealtorSchema } from "../../utils/domainSchemas";
import Modal from "../Modal";
import CreateRealtor from "../CreateRealtor";

export interface CreateSelectRealtorFieldProps<
  Schema extends FieldValues,
  SchemaField extends FieldPath<Schema>
> {
  fieldName: SchemaField;
  control: Control<Schema>;
  setValue: (name: SchemaField, value: string) => void;
  label?: string;
  validationError: FieldError | undefined;
  emptyValueLabel?: string;
}

export default function CreateSelectRealtorField<
  Schema extends FieldValues,
  SchemaField extends FieldPath<Schema>
>({
  fieldName,
  control,
  setValue,
  validationError,
  label,
  emptyValueLabel,
}: CreateSelectRealtorFieldProps<Schema, SchemaField>) {
  const { pushModal } = useModalContext();
  const realtors = useRealtorStore((store) => store.realtors);

  const handleNewRealtor = (newRaltorId: RealtorSchema["id"]) => {
    setValue(fieldName, newRaltorId);
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
        control={control}
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
