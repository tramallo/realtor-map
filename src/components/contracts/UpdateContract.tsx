import { CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Contract,
  UpdateContractDTO,
  updateContractDTO,
} from "../../utils/data-schema";
import {
  useContractStore,
  fetchByIdSelector,
} from "../../stores/contractsStore";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
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
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchContract = useContractStore((store) => store.fetchContract);
  const updateContract = useContractStore((store) => store.updateContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingContract, setUpdatingContract] = useState(false);

  const cachedContract = useContractStore(fetchByIdSelector(contractId));

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
        notifyUser("Error. Contract not updated.");
        return;
      }

      notifyUser("Contract updated.");
      if (onUpdate) {
        onUpdate();
      }
    },
    [contractId, updateContract, notifyUser, onUpdate]
  );

  useEffect(() => {
    console.log(`UpdateContract -> effect [fetchContract]`);

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
              : `Contract (id: ${contractId}) not found`}
          </Typography>
        )}
        {!fetchingContract && cachedContract && (
          <>
            <FormPropertyField fieldName="property" label="Property" />
            <FormPersonField fieldName="client" label="Client" />
            <FormDateField fieldName="start" label="Start" />
            <FormDateField fieldName="end" label="End" />
            <FormTextField
              fieldName="description"
              label="Description"
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
            label="Confirm update"
            color="warning"
            loading={updatingContract}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
