import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      notifyUser(t("errorMessages.clientNotDeleted"));
      return;
    }

    notifyUser(t("notifications.clientDeleted"));
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [updateClient, clientId, notifyUser, onSoftDelete, userSession, t]);

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
      notifyUser(t("errorMessages.clientNotRestored"));
      return;
    }

    notifyUser(t("notifications.clientRestored"));
    if (onRestore) {
      onRestore();
    }
  }, [clientId, updateClient, notifyUser, onRestore, userSession, t]);

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
            : t("errorMessages.clientNotFound", { clientId: clientId })}
        </Typography>
      )}
      {!fetchingClient && cachedClient && (
        <>
          {cachedClient.deleted && (
            <Chip
              label={t("entities.base.deleted")}
              color="error"
              variant="outlined"
            />
          )}
          {cachedClient.name && (
            <CustomTextField
              label={t("entities.client.name")}
              value={cachedClient.name ?? ""}
            />
          )}
          {cachedClient.mobile && (
            <CustomTextField
              label={t("entities.client.mobile")}
              value={cachedClient.mobile ?? ""}
            />
          )}
          {cachedClient.email && (
            <CustomTextField
              label={t("entities.client.email")}
              value={cachedClient.email ?? ""}
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
        {cachedClient && (
          <Button
            variant="contained"
            color={cachedClient.deleted ? "success" : "error"}
            onClick={cachedClient.deleted ? restoreClient : softDeleteClient}
            disabled={fetchingClient || restoringClient || softDeletingClient}
          >
            {softDeletingClient || restoringClient ? (
              <CircularProgress size="1.4em" />
            ) : (
              t("buttons.confirmButton.label")
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
