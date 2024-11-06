import {
  ArrayPath,
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
import { RealtorData } from "../../utils/domainSchemas";
import CreateRealtor from "../CreateRealtor";

export interface SelectRealtorFieldProps<
  Schema extends FieldValues,
  SchemaFieldName extends Path<Schema> | ArrayPath<Schema> = Path<Schema>,
  SchemaFieldValue extends PathValue<Schema, SchemaFieldName> = PathValue<
    Schema,
    SchemaFieldName
  >
> {
  fieldName: SchemaFieldName;
  label?: string;
  emptyRealtorLabel?: string;
  defaultRealtorId?: SchemaFieldValue;
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

  const handleNewRealtorCreate = (newRealtorId: RealtorData["id"]) => {
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
