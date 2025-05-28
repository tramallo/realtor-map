import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Client,
  UpdateClientDTO,
  updateClientDTO,
} from "../../utils/data-schema";
import { useClientStore, fetchByIdSelector } from "../../stores/clientsStore";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FormTextField } from "../form/FormTextField";
import { useAppContext } from "../AppContext";
import { useAuthStore } from "../../stores/authStore";

export interface UpdateClientProps {
  clientId: Client["id"];
  onUpdate?: () => void;
}

export default function UpdateClient({
  clientId,
  onUpdate,
}: UpdateClientProps) {
  const { t } = useTranslation();
  const userSession = useAuthStore(store => store.userSession);
  const { notifyUser } = useAppContext();
  const fetchClient = useClientStore((store) => store.fetchClient);
  const updateClient = useClientStore((store) => store.updateClient);

  const [fetchingClient, setFetchingClient] = useState(false);
  const [fetchClientResponse, setFetchClientResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingClient, setUpdatingClient] = useState(false);

  const cachedClient = useClientStore(fetchByIdSelector(clientId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdateClientDTO;

    return cachedClient
      ? { ...cachedClient, ...updateMetadata }
      : updateMetadata;
  }, [cachedClient, userSession]);

  const submitUpdate = useCallback(
    async (updatePersonData: UpdateClientDTO) => {
      console.log(`UpdateClient -> submitUpdate clientId: ${cachedClient?.id}`);

      setUpdatingClient(true);
      const updateResponse = await updateClient(clientId, updatePersonData);
      setUpdatingClient(false);

      if (updateResponse.error) {
        notifyUser(t("errorMessages.clientNotUpdated"));
        return;
      }

      notifyUser(t("notifications.clientUpdated"));
      if (onUpdate) {
        onUpdate();
      }
    },
    [clientId, cachedClient, updateClient, notifyUser, onUpdate, t]
  );

  //fetchClient effect
  useEffect(() => {
    setFetchClientResponse(undefined);
    setFetchingClient(true);
    fetchClient(clientId)
      .then(setFetchClientResponse)
      .finally(() => setFetchingClient(false));
  }, [clientId, fetchClient]);

  return (
    <MemoForm schema={updateClientDTO} prefillData={prefillData}>
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
            <FormTextField fieldName="name" label={t("entities.client.name")} />
            <FormTextField
              fieldName="mobile"
              label={t("entities.client.mobile")}
            />
            <FormTextField
              fieldName="email"
              label={t("entities.client.email")}
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
            loading={updatingClient}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
