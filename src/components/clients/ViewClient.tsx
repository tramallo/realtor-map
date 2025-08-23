import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useClientStore, fetchByIdSelector } from "../../stores/clientsStore";
import { Client } from "../../utils/data-schema";
import DeleteClient from "./DeleteClient";
import UpdateClient from "./UpdateClient";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";
import DateField from "../DateField";

export interface ViewClientProps {
  clientId: Client["id"];
}

export default function ViewClient({ clientId }: ViewClientProps) {
  const { t } = useTranslation();
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
              value={cachedClient.name ?? ""}
              label={t("entities.client.name")}
            />
          )}
          {cachedClient.mobile && (
            <CustomTextField
              value={cachedClient.mobile ?? ""}
              label={t("entities.client.mobile")}
            />
          )}
          {cachedClient.email && (
            <CustomTextField
              value={cachedClient.email ?? ""}
              label={t("entities.client.email")}
            />
          )}
          {cachedClient.createdBy && (
            <CustomTextField
              label={t("entities.base.createdBy")}
              value={cachedClient.createdBy}
            />
          )}
          {cachedClient.createdAt && (
            <DateField
              label={t("entities.base.createdAt")}
              value={cachedClient.createdAt}
            />
          )}
          {cachedClient.updatedBy && (
            <CustomTextField
              label={t("entities.base.updatedBy")}
              value={cachedClient.updatedBy}
            />
          )}
          {cachedClient.updatedAt && (
            <DateField
              label={t("entities.base.updatedAt")}
              value={cachedClient.updatedAt}
            />
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
              {cachedClient.deleted
                ? t("buttons.restoreButton.label")
                : t("buttons.deleteButton.label")}
            </Button>
            {!cachedClient.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateClientModalOpen(true)}
              >
                {t("buttons.updateButton.label")}
              </Button>
            )}
          </Stack>
          <CustomModal
            title={
              cachedClient.deleted
                ? t("titles.restoreClient")
                : t("titles.deleteClient")
            }
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
            title={t("titles.updateClient")}
            open={updateClientModalOpen}
            onClose={() => setUpdateClientModalOpen(false)}
          >
            <UpdateClient
              clientId={clientId}
              onUpdate={() => setUpdateClientModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
