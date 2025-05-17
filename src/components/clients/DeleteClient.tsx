import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useClientStore, fetchByIdSelector } from "../../stores/clientsStore";
import { Client, UpdateClientDTO } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { CustomTextField } from "../CustomTextField";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";

export interface DeleteClientProps {
  clientId: Client["id"];
  onSoftDelete?: () => void;
  onRestore?: () => void;
}

export default function DeleteClient({
  clientId,
  onSoftDelete,
  onRestore,
}: DeleteClientProps) {
  console.log(`DeleteClient -> render`);

  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchClient = useClientStore((store) => store.fetchClient);
  const updateClient = useClientStore((store) => store.updateClient);

  const [fetchingClient, setFetchingClient] = useState(false);
  const [fetchClientResponse, setFetchClientResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingClient, setSoftDeletingClient] = useState(false);
  const [restoringClient, setRestoringClient] = useState(false);

  const cachedClient = useClientStore(fetchByIdSelector(clientId));

  const softDeleteClient = useCallback(async () => {
    console.log(`DeleteClient -> softDeleteClient - clientId: ${clientId}`);

    setSoftDeletingClient(true);
    const softDeleteResponse = await updateClient(clientId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    } as UpdateClientDTO);
    setSoftDeletingClient(false);

    if (softDeleteResponse.error) {
      notifyUser("Error. Client not deleted.");
      return;
    }

    notifyUser("Client deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [updateClient, clientId, notifyUser, onSoftDelete, userSession]);

  const restoreClient = useCallback(async () => {
    console.log(`DeleteClient -> restoreClient - clientId: ${clientId}`);

    setRestoringClient(true);
    const restoreResponse = await updateClient(clientId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    } as UpdateClientDTO);
    setRestoringClient(false);

    if (restoreResponse.error) {
      notifyUser("Error. Client not restored.");
      return;
    }

    notifyUser("Client restored.");
    if (onRestore) {
      onRestore();
    }
  }, [clientId, updateClient, notifyUser, onRestore, userSession]);

  //fetchClient effect
  useEffect(() => {
    console.log(`DeleteClient -> effect [fetchClient]`);

    setFetchClientResponse(undefined);
    setFetchingClient(true);
    fetchClient(clientId)
      .then(setFetchClientResponse)
      .finally(() => setFetchingClient(false));
  }, [clientId, fetchClient]);

  return (
    <Stack spacing={2} padding={1}>
      {fetchingClient && (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      {!fetchingClient && !cachedClient && (
        <Typography
          variant="h6"
          align="center"
          color={fetchClientResponse?.error ? "error" : "warning"}
        >
          {fetchClientResponse?.error
            ? fetchClientResponse.error.message
            : `Client (id: ${clientId}) not found`}
        </Typography>
      )}
      {!fetchingClient && cachedClient && (
        <>
          {cachedClient.deleted && (
            <Chip label="Deleted" color="error" variant="outlined" />
          )}
          {cachedClient.name && (
            <CustomTextField label="Name" value={cachedClient.name ?? ""} />
          )}
          {cachedClient.mobile && (
            <CustomTextField label="Mobile" value={cachedClient.mobile ?? ""} />
          )}
          {cachedClient.email && (
            <CustomTextField label="Email" value={cachedClient.email ?? ""} />
          )}
        </>
      )}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >
        {cachedClient?.deleted && (
          <Button
            variant="contained"
            color="success"
            onClick={restoreClient}
            disabled={fetchingClient || restoringClient || softDeletingClient}
          >
            {restoringClient ? <CircularProgress /> : "Restore"}
          </Button>
        )}
        {cachedClient?.deleted !== true && (
          <Button
            variant="contained"
            color="warning"
            onClick={softDeleteClient}
            disabled={fetchingClient || restoringClient || softDeletingClient}
          >
            {softDeletingClient ? <CircularProgress /> : "Delete"}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
