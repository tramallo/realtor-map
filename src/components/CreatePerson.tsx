import "./CreatePerson.css";
import {
  CreatePersonData,
  CreatePersonSchema,
  createPersonSchema,
  PersonData,
} from "../utils/domainSchemas";
import { usePersonStore } from "../utils/domainDataStore";
import { useModalContext } from "./ModalContext";
import Form from "./form/Form";
import RHFMUITextField from "./form/RHFMUITextField";

export interface CreatePersonProps {
  onCreate?: (newPersonId: PersonData["id"]) => void;
  onClose?: () => void;
}

export default function CreatePerson({ onCreate, onClose }: CreatePersonProps) {
  const { popModal } = useModalContext();
  const createPerson = usePersonStore((store) => store.createPerson);

  const handleFormSubmit = async (newPersonData: CreatePersonData) => {

    console.log("submitt")
    console.log(newPersonData)

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
        <RHFMUITextField
          fieldName="name"
          label="Name"
        />
        <RHFMUITextField
          fieldName="mobile"
          label="Mobile"
        />
        <RHFMUITextField
          fieldName="email"
          label="Email"
        />
        <RHFMUITextField
          fieldName="createdBy"
          label="Created by"
          defaultValue="juanito"
          readOnly
        />
        <RHFMUITextField
          fieldName="createdAt"
          label="Created at"
          defaultValue="15/05/1999"
          readOnly
        />
    </Form>
  );
}
