import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
        notifyUser(t("errorMessages.contractNotCreated"));
        return;
      }

      notifyUser(t("notifications.contractCreated"));
      onCreate?.();
    },
    [createContract, notifyUser, onCreate, t]
  );

  return (
    <MemoForm schema={createContractDTO} prefillData={prefillData}>
      <Stack spacing={2} padding={1}>
        <FormPropertyField
          fieldName="property"
          label={t("entities.contract.property")}
          readOnly={creatingContract}
        />
        <FormPersonField
          fieldName="client"
          label={t("entities.contract.client")}
          readOnly={creatingContract}
        />
        <FormDateField
          fieldName="start"
          label={t("entities.contract.start")}
          disabled={creatingContract}
        />
        <FormDateField
          fieldName="end"
          label={t("entities.contract.end")}
          disabled={creatingContract}
        />
        <FormTextField
          fieldName="description"
          label={t("entities.contract.description")}
          multiline
          disabled={creatingContract}
        />

        <Stack direction="row" spacing={2} justifyContent="end">
          <MemoSubmitButton
            onSubmit={onSubmit}
            label={t("buttons.confirmButton.label")}
            loading={creatingContract}
            disabled={creatingContract}
            color="success"
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
