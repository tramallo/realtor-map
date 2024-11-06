import "./CreatePerson.css";
import {
  CreatePersonData,
  CreatePersonSchema,
  createPersonSchema,
  PersonData,
} from "../utils/domainSchemas";
import TextField from "./form/TextField";
import { usePersonStore } from "../utils/domainDataStore";
import { useModalContext } from "./ModalContext";
import Form from "./form/Form";
import DateField from "./form/DateField";

export interface CreatePersonProps {
  onCreate?: (newPersonId: PersonData["id"]) => void;
  onClose?: () => void;
}

export default function CreatePerson({ onCreate, onClose }: CreatePersonProps) {
  const { popModal } = useModalContext();
  const createPerson = usePersonStore((store) => store.createPerson);

  const handleFormSubmit = async (newPersonData: CreatePersonData) => {
    const { error, data: personId } = await createPerson(newPersonData);

    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
    if (onCreate) {
      onCreate(personId);
    }
  };

  const handleFormCancel = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form<CreatePersonSchema>
      schema={createPersonSchema}
      onSubmit={handleFormSubmit}
      onCancel={handleFormCancel}
      submitButtonLabel="Create person"
    >
      <TextField fieldName="name" label="Name" />
      <TextField fieldName="mobile" label="Mobile" />
      <TextField fieldName="email" label="Email" />
      <TextField
        fieldName="createdBy"
        label="Created by"
        defaultValue="sancho"
        readOnly
      />
      <DateField
        fieldName="createdAt"
        label="Created at"
        defaultValue={new Date()}
        readOnly
      />
    </Form>
  );
}
