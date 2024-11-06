import {
  ArrayPath,
  Controller,
  FieldError,
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import "./SelectPersonField.css";
import { usePersonStore } from "../../utils/domainDataStore";
import { useModalContext } from "../ModalContext";
import Modal from "../Modal";
import CreatePerson from "../CreatePerson";
import { PersonData } from "../../utils/domainSchemas";

export interface SelectPersonFieldProps<
  Schema extends FieldValues,
  SchemaFieldName extends Path<Schema> | ArrayPath<Schema> = Path<Schema>,
  SchemaFieldValue extends PathValue<Schema, SchemaFieldName> = PathValue<
    Schema,
    SchemaFieldName
  >
> {
  fieldName: SchemaFieldName;
  label?: string;
  emptyPersonLabel?: string;
  defaultPersonId?: SchemaFieldValue;
  allowCreateNewPerson?: boolean;
}

export default function SelectPersonField<Schema extends FieldValues>({
  fieldName,
  label,
  emptyPersonLabel,
  defaultPersonId,
  allowCreateNewPerson,
}: SelectPersonFieldProps<Schema>) {
  const persons = usePersonStore((store) => store.persons);
  const {
    control,
    formState: { errors },
    setValue,
  } = useFormContext<Schema>();
  const { pushModal } = useModalContext();

  const error = errors[fieldName] as FieldError | undefined;

  const handleNewPersonCreate = (newPersonId: PersonData["id"]) => {
    setValue(fieldName, newPersonId as PathValue<Schema, Path<Schema>>);
  };

  const openCreatePersonModal = () => {
    const createPersonModal = (
      <Modal title="Create person">
        <CreatePerson onCreate={handleNewPersonCreate} />
      </Modal>
    );

    pushModal(createPersonModal);
  };

  return (
    <div className="select-person-field">
      {label && <label>{label}</label>}
      <div className="select-person-field-controls">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={defaultPersonId}
          render={({ field }) => (
            <select {...field}>
              {emptyPersonLabel && <option value="">{emptyPersonLabel}</option>}
              {persons.map((person, index) => (
                <option key={`${fieldName}-option-${index}`} value={person.id}>
                  {person.name} ; {person.mobile ?? ""} ; {person.email ?? ""}
                </option>
              ))}
            </select>
          )}
        />
        {allowCreateNewPerson && (
          <button type="button" onClick={openCreatePersonModal}>
            New Person
          </button>
        )}
      </div>
      {error && <span>{error.message}</span>}
    </div>
  );
}
