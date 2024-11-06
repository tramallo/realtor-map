import "./CreateRealtor.css";
import { useRealtorStore } from "../utils/domainDataStore";
import {
  CreateRealtorData,
  CreateRealtorSchema,
  createRealtorSchema,
  RealtorData,
} from "../utils/domainSchemas";
import { useModalContext } from "./ModalContext";
import TextField from "./form/TextField";
import DateField from "./form/DateField";
import Form from "./form/Form";

export interface CreateRealtorProps {
  onCreate?: (newRealtorId: RealtorData["id"]) => void;
  onClose?: () => void;
}

export default function CreateRealtor({
  onCreate,
  onClose,
}: CreateRealtorProps) {
  const { popModal } = useModalContext();
  const createRealtor = useRealtorStore((store) => store.createRealtor);

  const handleFormSubmit = async (newRealtorData: CreateRealtorData) => {
    const { error, data: realtorId } = await createRealtor(newRealtorData);

    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
    if (onCreate) {
      onCreate(realtorId);
    }
  };

  const handleFormCancel = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <Form<CreateRealtorSchema>
      schema={createRealtorSchema}
      onSubmit={handleFormSubmit}
      onCancel={handleFormCancel}
    >
      <TextField fieldName="name" label="Name" />
      <TextField
        fieldName="createdBy"
        label="Created by"
        defaultValue="juano"
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
