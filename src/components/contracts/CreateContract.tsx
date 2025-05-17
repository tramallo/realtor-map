import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import FormDateField from "../form/FormDateField";
import FormPersonField from "../form/FormPersonField";
import { FormTextField } from "../form/FormTextField";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import { dateToTimestamp } from "../../utils/helperFunctions";
import {
  Contract,
  createContractDTO,
  CreateContractDTO,
} from "../../utils/data-schema";
import { useContractStore } from "../../stores/contractsStore";
import FormPropertyField from "../form/FormPropertyField";

export interface CreateContractProps {
  prefillContract?: Partial<CreateContractDTO>;
  onCreate?: () => void;
}

export default function CreateContract({
  prefillContract,
  onCreate,
}: CreateContractProps) {
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const createContract = useContractStore((store) => store.createContract);

  const [creatingContract, setCreatingContract] = useState(false);

  const prefillData = useMemo(
    () =>
      ({
        ...prefillContract,
        createdBy: userSession?.user.id,
        createdAt: dateToTimestamp(new Date()),
      } as CreateContractDTO),
    [prefillContract, userSession]
  );

  const onSubmit = useCallback(
    async (contractData: Contract) => {
      setCreatingContract(true);
      const { error } = await createContract(contractData);
      setCreatingContract(false);

      if (error) {
        console.log(error);
        notifyUser("Error. Contract not created.");
        return;
      }

      notifyUser("Contract created.");
      onCreate?.();
    },
    [createContract, notifyUser, onCreate]
  );

  return (
    <MemoForm schema={createContractDTO} prefillData={prefillData}>
      <Stack spacing={2} padding={1}>
        <FormPropertyField
          fieldName="property"
          label="Property"
          readOnly={creatingContract}
        />
        <FormPersonField
          fieldName="client"
          label="Client"
          readOnly={creatingContract}
        />
        <FormDateField
          fieldName="start"
          label="Start"
          disabled={creatingContract}
        />
        <FormDateField
          fieldName="end"
          label="End"
          disabled={creatingContract}
        />
        <FormTextField
          fieldName="description"
          label="Description"
          multiline
          disabled={creatingContract}
        />

        <Stack direction="row" spacing={2} justifyContent="end">
          <MemoSubmitButton
            onSubmit={onSubmit}
            label="Create"
            loading={creatingContract}
            disabled={creatingContract}
            color="success"
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
