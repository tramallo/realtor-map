import { useForm } from "react-hook-form";

import "./CreateRealtor.css";
import { useRealtorStore } from "../utils/domainDataStore";
import {
  createRealtorSchema,
  CreateRealtorSchema,
  getStripAndZodResolver,
  RealtorSchema,
} from "../utils/domainSchemas";
import { useModalContext } from "./ModalContext";
import TextField from "./form/TextField";
import DateField from "./form/DateField";

export interface CreateRealtorProps {
  onCreate: (newRealtorId: RealtorSchema["id"]) => void;
  onClose?: () => void;
}

export default function CreateRealtor({
  onCreate,
  onClose,
}: CreateRealtorProps) {
  const { popModal } = useModalContext();
  const createRealtor = useRealtorStore((store) => store.createRealtor);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRealtorSchema>({
    resolver: getStripAndZodResolver(createRealtorSchema),
  });

  const onSubmit = async (newRealtorData: CreateRealtorSchema) => {
    const { error, data: realtorId } = await createRealtor(newRealtorData);

    if (error) {
      //TODO: show error on ui
      console.log(error);
      return;
    }

    popModal();
    onCreate(realtorId);
  };

  const handleCloseButtonClick = () => {
    popModal();
    if (onClose) {
      onClose();
    }
  };

  return (
    <form className="create-realtor">
      <div className="create-realtor-fields">
        <TextField
          label="Name"
          registration={register("name")}
          validationError={errors.name}
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

      <div className="create-realtor-controls">
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
