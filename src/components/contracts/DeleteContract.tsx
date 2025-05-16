import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  useContractStore,
  fetchByIdSelector,
} from "../../stores/contractsStore";
import { Contract, UpdateContractDTO } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
import { CustomTextField } from "../CustomTextField";
import ClientChip from "../ClientChip";
import PropertyChip from "../PropertyChip";
import ComponentsField from "../ComponentsField";
import { format } from "date-fns";

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
  console.log(`DeleteContract -> render`);

  const { userSession } = useAuthContext();
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
      notifyUser("Error. Contract not deleted.");
      return;
    }

    notifyUser("Contract deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [contractId, updateContract, notifyUser, onSoftDelete, userSession]);

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
      notifyUser("Error. Contract not restored.");
      return;
    }

    notifyUser("Contract restored.");
    if (onRestore) {
      onRestore();
    }
  }, [contractId, updateContract, notifyUser, onRestore, userSession]);

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
            : `Contract (id: ${contractId}) not found`}
        </Typography>
      )}
      {!fetchingContract && cachedContract && (
        <>
          {cachedContract.deleted && (
            <Chip label="Deleted" color="error" variant="outlined" />
          )}
          <ComponentsField
            label="Property"
            components={[<PropertyChip propertyId={cachedContract.property} />]}
          />
          <ComponentsField
            label="Client"
            components={[<ClientChip clientId={cachedContract.client} />]}
          />
          <CustomTextField
            label="Start Date"
            value={format(new Date(cachedContract.start), "PP")}
          />
          <CustomTextField
            label="End Date"
            value={format(new Date(cachedContract.end), "PP")}
          />
          {cachedContract.description && (
            <CustomTextField
              label="Description"
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
        {cachedContract?.deleted && (
          <Button
            variant="contained"
            color="success"
            onClick={restoreContract}
            disabled={
              !cachedContract ||
              fetchingContract ||
              restoringContract ||
              softDeletingContract
            }
          >
            {restoringContract ? <CircularProgress size="1.4em" /> : "Restore"}
          </Button>
        )}
        {cachedContract?.deleted !== true && (
          <Button
            variant="contained"
            color="warning"
            onClick={softDeleteContract}
            disabled={
              fetchingContract || restoringContract || softDeletingContract
            }
          >
            {softDeletingContract ? (
              <CircularProgress size="1.4em" />
            ) : (
              "Delete"
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
