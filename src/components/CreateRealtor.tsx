import { useRealtorStore } from "../utils/domainDataStore";
import {
  CreateRealtorData,
  CreateRealtorSchema,
  createRealtorSchema,
  RealtorData,
} from "../utils/domainSchemas";
import { useModalContext } from "./ModalContext";
import DateField from "./form/DateField";
import Form from "./form/Form";
import MuiTextField from "./form/MuiTextField";

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
      <MuiTextField fieldName="name" label="Name" />
      <MuiTextField
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
