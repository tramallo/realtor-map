import { useFormContext } from "react-hook-form";

import { usePersonStore } from "../../utils/domainDataStore";
import { useModalContext } from "../ModalContext";
import Modal from "../Modal";
import CreatePerson from "../CreatePerson";
import { PersonData } from "../../utils/domainSchemas";
import SelectField from "./SelectField";

export interface SelectPersonFieldProps {
  fieldName: string;
  label?: string;
  defaultPersonId?: string;
  allowCreateNewPerson?: boolean;
  emptyOptionLabel?: string;
}

export default function SelectPersonField({
  fieldName,
  label,
  defaultPersonId,
  allowCreateNewPerson,
  emptyOptionLabel,
}: SelectPersonFieldProps) {
  const persons = usePersonStore((store) => store.persons);
  const { pushModal } = useModalContext();
  const { setValue } = useFormContext();

  const handleNewPersonCreate = (newPersonId: PersonData["id"]) => {
    setValue(fieldName, newPersonId);
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
    <SelectField
      fieldName={fieldName}
      label={label}
      defaultValue={defaultPersonId}
      options={persons.map((person) => ({
        label: person.name,
        value: person.id,
      }))}
      emptyOptionLabel={emptyOptionLabel}
      actionButtonLabel={allowCreateNewPerson ? "New person" : undefined}
      actionButtonOnClick={
        allowCreateNewPerson ? openCreatePersonModal : undefined
      }
    />
  );
}
