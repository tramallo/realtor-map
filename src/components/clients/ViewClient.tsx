import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useClientStore, fetchByIdSelector } from "../../stores/clientsStore";
import { Client } from "../../utils/data-schema";
import DeleteClient from "./DeleteClient";
import UpdatePerson from "./UpdateClient";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";
import DateField from "../DateField";

export interface ViewClientProps {
  clientId: Client["id"];
}

export default function ViewClient({ clientId }: ViewClientProps) {
  const fetchClient = useClientStore((store) => store.fetchClient);

  const [fetchingClient, setFetchingClient] = useState(false);
  const [fetchClientResponse, setFetchClientResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deleteClientModalOpen, setDeleteClientModalOpen] = useState(false);
  const [updateClientModalOpen, setUpdateClientModalOpen] = useState(false);

  const cachedClient = useClientStore(fetchByIdSelector(clientId));

  //fetchClient effect
  useEffect(() => {
    console.log(`ViewClient -> effect [fetchClient]`);

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
            <CustomTextField value={cachedClient.name ?? ""} label="Name" />
          )}
          {cachedClient.mobile && (
            <CustomTextField value={cachedClient.mobile ?? ""} label="Mobile" />
          )}
          {cachedClient.email && (
            <CustomTextField value={cachedClient.email ?? ""} label="Email" />
          )}
          {cachedClient.createdBy && (
            <CustomTextField
              label="Created by"
              value={cachedClient.createdBy}
            />
          )}
          {cachedClient.createdAt && (
            <DateField label="Created at" value={cachedClient.createdAt} />
          )}
          {cachedClient.updatedBy && (
            <CustomTextField
              label="Updated by"
              value={cachedClient.updatedBy}
            />
          )}
          {cachedClient.updatedAt && (
            <DateField label="Updated at" value={cachedClient.updatedAt} />
          )}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <Button
              variant="contained"
              color={cachedClient.deleted ? "success" : "error"}
              onClick={() => setDeleteClientModalOpen(true)}
            >
              {cachedClient.deleted ? "Restore" : "Delete"}
            </Button>
            {!cachedClient.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateClientModalOpen(true)}
              >
                Update
              </Button>
            )}
          </Stack>
          <CustomModal
            title={`Delete client: ${clientId}`}
            open={deleteClientModalOpen}
            onClose={() => setDeleteClientModalOpen(false)}
          >
            <DeleteClient
              clientId={clientId}
              onSoftDelete={() => setDeleteClientModalOpen(false)}
              onRestore={() => setDeleteClientModalOpen(false)}
            />
          </CustomModal>
          <CustomModal
            title={`Update client: ${clientId}`}
            open={updateClientModalOpen}
            onClose={() => setUpdateClientModalOpen(false)}
          >
            <UpdatePerson
              clientId={clientId}
              onUpdate={() => setUpdateClientModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
