import {
  Control,
  Controller,
  FieldError,
  FieldPath,
  FieldValues,
} from "react-hook-form";

import "./FormCreateSelectPerson.css";
import { usePersonStore } from "../../utils/domainDataStore";
import { Person } from "../../utils/domainSchemas";
import CreatePersonForm from "../CreatePersonForm";
import Modal from "../Modal";
import { useModalContext } from "../ModalContext";

const personToString = (person: Person) =>
  `${person.name} - ${person.mobile ?? ""} - ${person.email ?? ""}`;

export interface FormCreateSelectPersonProps<
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

export default function FormCreateSelectPerson<
  Schema extends FieldValues,
  SchemaField extends FieldPath<Schema>
>({
  fieldName,
  control,
  setValue,
  validationError,
  label,
  emptyValueLabel,
}: FormCreateSelectPersonProps<Schema, SchemaField>) {
  const { pushModal } = useModalContext();

  const persons = usePersonStore((store) => store.persons);

  const handleNewPerson = (newPersonId: Person["id"]) => {
    setValue(fieldName, newPersonId);
  };

  const openCreatePersonModal = () => {
    const createPersonModal = (
      <Modal title="Create person">
        <CreatePersonForm onCreate={handleNewPerson} />
      </Modal>
    );

    pushModal(createPersonModal);
  };

  return (
    <div className="form-create-select-person">
      <label>{label ?? fieldName}</label>
      <Controller
        name={fieldName}
        control={control}
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
