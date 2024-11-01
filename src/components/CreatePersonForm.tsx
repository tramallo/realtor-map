import { useForm } from "react-hook-form";

import "./CreatePersonForm.css";
import {
  CreatePerson,
  createPersonSchema,
  getStripAndZodResolver,
  Person,
} from "../utils/domainSchemas";
import FormTextField from "./form/FormTextField";
import { usePersonStore } from "../utils/domainDataStore";
import FormDateField from "./form/FormDateField";
import { useModalContext } from "./ModalContext";

export interface CreatePersonFormProps {
  onCreate: (newPersonId: Person["id"]) => void;
  onClose?: () => void;
}

export default function CreatePersonForm({
  onCreate,
  onClose,
}: CreatePersonFormProps) {
  const { popModal } = useModalContext();

  const createPerson = usePersonStore((store) => store.createPerson);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePerson>({
    resolver: getStripAndZodResolver(createPersonSchema),
  });

  const onSubmit = async (newPersonData: CreatePerson) => {
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
    <form className="create-person-form">
      <div className="create-person-form-fields">
        <FormTextField
          label="Name"
          registration={register("name")}
          validationError={errors.name}
        />
        <FormTextField
          label="Mobile"
          registration={register("mobile")}
          validationError={errors.mobile}
        />
        <FormTextField
          label="Email"
          registration={register("email")}
          validationError={errors.email}
        />
        <FormTextField
          label="Created by"
          registration={register("createdBy")}
          validationError={errors.createdBy}
          value="juano"
          readOnly
        />
        <FormDateField
          label="Created at"
          registration={register("createdAt")}
          validationError={errors.createdAt}
          value={new Date()}
          readOnly
        />
      </div>

      <div className="create-person-form-controls">
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
