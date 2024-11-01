import { useForm } from "react-hook-form";

import "./CreatePerson.css";
import {
  CreatePersonSchema,
  createPersonSchema,
  getStripAndZodResolver,
  PersonSchema,
} from "../utils/domainSchemas";
import TextField from "./form/TextField";
import { usePersonStore } from "../utils/domainDataStore";
import DateField from "./form/DateField";
import { useModalContext } from "./ModalContext";

export interface CreatePersonProps {
  onCreate: (newPersonId: PersonSchema["id"]) => void;
  onClose?: () => void;
}

export default function CreatePerson({ onCreate, onClose }: CreatePersonProps) {
  const { popModal } = useModalContext();

  const createPerson = usePersonStore((store) => store.createPerson);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePersonSchema>({
    resolver: getStripAndZodResolver(createPersonSchema),
  });

  const onSubmit = async (newPersonData: CreatePersonSchema) => {
    const { error, data: personId } = await createPerson(newPersonData);

    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    onCreate(personId);
    popModal();
  };

  const handleCloseButtonClick = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <form className="create-person">
      <div className="create-person-fields">
        <TextField
          label="Name"
          registration={register("name")}
          validationError={errors.name}
        />
        <TextField
          label="Mobile"
          registration={register("mobile")}
          validationError={errors.mobile}
        />
        <TextField
          label="Email"
          registration={register("email")}
          validationError={errors.email}
        />
        <TextField
          label="Created by"
          registration={register("createdBy")}
          validationError={errors.createdBy}
          value="juano"
          readOnly
        />
        <DateField
          label="Created at"
          registration={register("createdAt")}
          validationError={errors.createdAt}
          value={new Date()}
          readOnly
        />
      </div>

      <div className="create-person-controls">
        <button type="button" onClick={handleCloseButtonClick}>
          Close
        </button>
        <button type="button" onClick={handleSubmit(onSubmit)}>
          Create
        </button>
      </div>
    </form>
  );
}
