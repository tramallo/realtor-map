import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Contract,
  UpdateContractDTO,
  updateContractDTO,
} from "../../utils/data-schema";
import {
  useContractStore,
  selectContractById,
} from "../../stores/contractsStore";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import { FormTextField } from "../form/FormTextField";
import FormPropertyField from "../form/FormPropertyField";
import FormPersonField from "../form/FormPersonField";
import FormDateField from "../form/FormDateField";

export interface UpdateContractProps {
  contractId: Contract["id"];
  onUpdate?: () => void;
}

export default function UpdateContract({
  contractId,
  onUpdate,
}: UpdateContractProps) {
  const { t } = useTranslation();
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchContract = useContractStore((store) => store.fetchContract);
  const updateContract = useContractStore((store) => store.updateContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingContract, setUpdatingContract] = useState(false);

  const cachedContract = useContractStore(selectContractById(contractId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdateContractDTO;

    return cachedContract
      ? { ...cachedContract, ...updateMetadata }
      : updateMetadata;
  }, [cachedContract, userSession]);

  const submitUpdate = useCallback(
    async (updateContractData: UpdateContractDTO) => {
      console.log(`UpdateContract -> submitUpdate contractId: ${contractId}`);

      setUpdatingContract(true);
      const updateResponse = await updateContract(
        contractId,
        updateContractData
      );
      setUpdatingContract(false);

      if (updateResponse.error) {
        notifyUser(t("errorMessages.contractNotUpdated"));
        return;
      }

      notifyUser(t("notifications.contractUpdated"));
      if (onUpdate) {
        onUpdate();
      }
    },
    [contractId, updateContract, notifyUser, onUpdate, t]
  );

  //fetchContract effect
  useEffect(() => {
    setFetchContractResponse(undefined);
    setFetchingContract(true);
    fetchContract(contractId)
      .then(setFetchContractResponse)
      .finally(() => setFetchingContract(false));
  }, [contractId, fetchContract]);

  return (
    <MemoForm schema={updateContractDTO} prefillData={prefillData}>
      <Stack spacing={2} padding={1}>
        {fetchingContract && (
          <Typography align="center">
            <CircularProgress />
          </Typography>
        )}
        {!fetchingContract && !cachedContract && (
          <Typography
            variant="h6"
            align="center"
            color={fetchContractResponse?.error ? "error" : "warning"}
          >
            {fetchContractResponse?.error
              ? fetchContractResponse.error.message
              : t("errorMessages.contractNotFound", { contractId: contractId })}
          </Typography>
        )}
        {!fetchingContract && cachedContract && (
          <>
            {cachedContract.deleted && (
              <Chip
                label={t("entities.base.deleted")}
                color="error"
                variant="outlined"
              />
            )}
            <FormPropertyField
              fieldName="property"
              label={t("entities.contract.property")}
            />
            <FormPersonField
              fieldName="client"
              label={t("entities.contract.client")}
            />
            <FormDateField
              fieldName="start"
              label={t("entities.contract.start")}
            />
            <FormDateField fieldName="end" label={t("entities.contract.end")} />
            <FormTextField
              fieldName="description"
              label={t("entities.contract.description")}
              multiline
            />
          </>
        )}

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={submitUpdate}
            label={t("buttons.confirmButton.label")}
            color="warning"
            loading={updatingContract}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
