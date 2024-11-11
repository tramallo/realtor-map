import { useFormContext } from "react-hook-form";

import { useRealtorStore } from "../../utils/domainDataStore";
import { useModalContext } from "../ModalContext";
import Modal from "../Modal";
import { RealtorData } from "../../utils/domainSchemas";
import CreateRealtor from "../CreateRealtor";
import SelectField from "./SelectField";

export interface SelectRealtorFieldProps {
  fieldName: string;
  label?: string;
  emptyOptionLabel?: string;
  defaultRealtorId?: string;
  allowCreateNewRealtor?: boolean;
}

export default function SelectRealtorField({
  fieldName,
  label,
  emptyOptionLabel,
  defaultRealtorId,
  allowCreateNewRealtor,
}: SelectRealtorFieldProps) {
  const realtors = useRealtorStore((store) => store.realtors);
  const { setValue } = useFormContext();
  const { pushModal } = useModalContext();

  const handleNewRealtorCreate = (newRealtorId: RealtorData["id"]) => {
    setValue(fieldName, newRealtorId);
  };

  const openCreateRealtorModal = () => {
    const createRealtorModal = (
      <Modal title="Create realtor">
        <CreateRealtor onCreate={handleNewRealtorCreate} />
      </Modal>
    );

    pushModal(createRealtorModal);
  };

  return (
    <SelectField
      fieldName={fieldName}
      label={label}
      defaultValue={defaultRealtorId}
      options={realtors.map((realtor) => ({
        label: realtor.name,
        value: realtor.id,
      }))}
      emptyOptionLabel={emptyOptionLabel}
      actionButtonLabel={allowCreateNewRealtor ? "New realtor" : undefined}
      actionButtonOnClick={
        allowCreateNewRealtor ? openCreateRealtorModal : undefined
      }
    />
  );
}
