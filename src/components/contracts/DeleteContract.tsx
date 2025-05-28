import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  useContractStore,
  fetchByIdSelector,
} from "../../stores/contractsStore";
import { Contract, UpdateContractDTO } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { CustomTextField } from "../CustomTextField";
import ClientChip from "../ClientChip";
import PropertyChip from "../PropertyChip";
import ComponentsField from "../ComponentsField";
import { useAppContext } from "../AppContext";
import DateField from "../DateField";
import { useAuthStore } from "../../stores/authStore";

export interface DeleteContractProps {
  contractId: Contract["id"];
  onSoftDelete?: () => void;
  onRestore?: () => void;
}

export default function DeleteContract({
  contractId,
  onSoftDelete,
  onRestore,
}: DeleteContractProps) {
  const { t } = useTranslation();
  const userSession = useAuthStore(store => store.userSession);
  const { notifyUser } = useAppContext();
  const fetchContract = useContractStore((store) => store.fetchContract);
  const updateContract = useContractStore((store) => store.updateContract);

  const [fetchingContract, setFetchingContract] = useState(false);
  const [fetchContractResponse, setFetchContractResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingContract, setSoftDeletingContract] = useState(false);
  const [restoringContract, setRestoringContract] = useState(false);

  const cachedContract = useContractStore(fetchByIdSelector(contractId));

  const softDeleteContract = useCallback(async () => {
    console.log(`DeleteContract -> softDeleteContract ${contractId}`);

    setSoftDeletingContract(true);
    const deleteResponse = await updateContract(contractId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    } as UpdateContractDTO);
    setSoftDeletingContract(false);

    if (deleteResponse.error) {
      notifyUser(t("errorMessages.contractNotDeleted"));
      return;
    }

    notifyUser(t("notifications.contractDeleted"));
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [contractId, updateContract, notifyUser, onSoftDelete, userSession, t]);

  const restoreContract = useCallback(async () => {
    console.log(`DeleteContract -> restoreContract ${contractId}`);

    setRestoringContract(true);
    const restoreResponse = await updateContract(contractId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    } as UpdateContractDTO);
    setRestoringContract(false);

    if (restoreResponse.error) {
      notifyUser(t("errorMessages.contractNotRestored"));
      return;
    }

    notifyUser(t("notifications.contractRestored"));
    if (onRestore) {
      onRestore();
    }
  }, [contractId, updateContract, notifyUser, onRestore, userSession, t]);

  useEffect(() => {
    console.log(`DeleteContract -> effect [fetchContract]`);

    setFetchContractResponse(undefined);
    setFetchingContract(true);
    fetchContract(contractId)
      .then(setFetchContractResponse)
      .finally(() => setFetchingContract(false));
  }, [contractId, fetchContract]);

  return (
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
          <ComponentsField
            label={t("entities.contract.property")}
            components={[<PropertyChip propertyId={cachedContract.property} />]}
          />
          <ComponentsField
            label={t("entities.contract.client")}
            components={[<ClientChip clientId={cachedContract.client} />]}
          />
          <DateField
            label={t("entities.contract.start")}
            value={cachedContract.start}
            readOnly
          />
          <DateField
            label={t("entities.contract.end")}
            value={cachedContract.end}
            readOnly
          />
          {cachedContract.description && (
            <CustomTextField
              label={t("entities.contract.description")}
              value={cachedContract.description}
              multiline
            />
          )}
        </>
      )}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >
        {cachedContract && (
          <Button
            variant="contained"
            color={cachedContract.deleted ? "success" : "error"}
            onClick={
              cachedContract.deleted ? restoreContract : softDeleteContract
            }
            disabled={
              !cachedContract ||
              fetchingContract ||
              restoringContract ||
              softDeletingContract
            }
          >
            {restoringContract || softDeletingContract ? (
              <CircularProgress size="1.4em" />
            ) : cachedContract.deleted ? (
              t("buttons.restoreButton.label")
            ) : (
              t("buttons.deleteButton.label")
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
