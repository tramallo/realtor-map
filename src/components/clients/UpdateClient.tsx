import { CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
import { FormTextField } from "../form/FormTextField";

export interface UpdateClientProps {
  clientId: Client["id"];
  onUpdate?: () => void;
}

export default function UpdatePerson({
  clientId,
  onUpdate,
}: UpdateClientProps) {
  const { userSession } = useAuthContext();
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
        notifyUser("Error. Client not updated.");
        return;
      }

      notifyUser("Client updated.");
      if (onUpdate) {
        onUpdate();
      }
    },
    [clientId, cachedClient, updateClient, notifyUser, onUpdate]
  );

  //fetchClient effect
  useEffect(() => {
    console.log(`UpdateClient -> effect [fetchClient]`);

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
              : `Client (id: ${clientId}) not found`}
          </Typography>
        )}
        {!fetchingClient && cachedClient && (
          <>
            <FormTextField fieldName="name" label="Name" />
            <FormTextField fieldName="mobile" label="Mobile" />
            <FormTextField fieldName="email" label="Email" />
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
            loading={updatingClient}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
