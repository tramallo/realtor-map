import {
  Controller,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./SelectRealtorField.css";
import { useRealtorStore } from "../../utils/domainDataStore";
import { useModalContext } from "../ModalContext";
import Modal from "../Modal";
import { RealtorSchema } from "../../utils/domainSchemas";
import CreateRealtor from "../CreateRealtor";

export interface SelectRealtorFieldProps<Schema extends FieldValues> {
  fieldName: Path<Schema>;
  label?: string;
  emptyRealtorLabel?: string;
  defaultRealtorId?: PathValue<Schema, Path<Schema>>;
  allowCreateNewRealtor?: boolean;
}

export default function SelectRealtorField<Schema extends FieldValues>({
  fieldName,
  label,
  emptyRealtorLabel,
  defaultRealtorId,
  allowCreateNewRealtor,
}: SelectRealtorFieldProps<Schema>) {
  const realtors = useRealtorStore((store) => store.realtors);
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<Schema>();
  const { pushModal } = useModalContext();

  const error = errors[fieldName] as FieldError | undefined;

  const handleNewRealtorCreate = (newRealtorId: RealtorSchema["id"]) => {
    setValue(fieldName, newRealtorId as PathValue<Schema, Path<Schema>>);
  };

  const openCreateRealtorModal = () => {
    const createRealtorModal = (
      <Modal title="Create realtor">
        <CreateRealtor onCreate={handleNewRealtorCreate} />
      </Modal>
    );

    pushModal(createRealtorModal);
  };

  return (
    <div className="select-realtor-field">
      {label && <label>{label}</label>}
      <div className="select-realtor-field-controls">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={defaultRealtorId}
          render={({ field }) => (
            <select {...field}>
              {emptyRealtorLabel && (
                <option value="">{emptyRealtorLabel}</option>
              )}
              {realtors.map((realtor, index) => (
                <option key={`${fieldName}-option-${index}`} value={realtor.id}>
                  {realtor.name}
                </option>
              ))}
            </select>
          )}
        />
        {allowCreateNewRealtor && (
          <button type="button" onClick={openCreateRealtorModal}>
            New Realtor
          </button>
        )}
      </div>
      {error && <span>{error.message}</span>}
    </div>
  );
}
