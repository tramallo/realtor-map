import {
  Controller,
  FieldError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

import "./CreateSelectPersonField.css";
import { usePersonStore } from "../../utils/domainDataStore";
import { PersonSchema } from "../../utils/domainSchemas";
import CreatePerson from "../CreatePerson";
import Modal from "../Modal";
import { useModalContext } from "../ModalContext";

const personToString = (person: PersonSchema) =>
  `${person.name} - ${person.mobile ?? ""} - ${person.email ?? ""}`;

export interface CreateSelectPersonFieldProps<
  Schema extends FieldValues,
  SchemaField = FieldPath<Schema>
> {
  formData: UseFormReturn<Schema>;
  fieldName: SchemaField;
  label?: string;
  emptyValueLabel?: string;
}

export default function CreateSelectPersonField<
  Schema extends FieldValues,
  SchemaValue extends FieldPathValue<Schema, FieldPath<Schema>>
>({
  formData,
  fieldName,
  label,
  emptyValueLabel,
}: CreateSelectPersonFieldProps<Schema>) {
  const { pushModal } = useModalContext();
  const persons = usePersonStore((store) => store.persons);

  const validationError = formData.formState.errors[fieldName] as
    | FieldError
    | undefined;

  const handleNewPerson = (newPersonId: PersonSchema["id"]) => {
    formData.setValue(fieldName, newPersonId as SchemaValue);
  };

  const openCreatePersonModal = () => {
    const createPersonModal = (
      <Modal title="Create person">
        <CreatePerson onCreate={handleNewPerson} />
      </Modal>
    );

    pushModal(createPersonModal);
  };

  return (
    <div className="create-select-person-field">
      <label>{label ?? fieldName}</label>
      <Controller
        name={fieldName}
        control={formData.control}
        render={({ field }) => (
          <select {...field}>
            {emptyValueLabel && <option value="">{emptyValueLabel}</option>}
            {persons.map((person) => (
              <option key={person.id} value={person.id}>
                {personToString(person)}
              </option>
            ))}
          </select>
        )}
      />
      {validationError && <span>{validationError.message}</span>}
      <button type="button" onClick={openCreatePersonModal}>
        New Person
      </button>
    </div>
  );
}
