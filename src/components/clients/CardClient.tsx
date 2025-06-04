import { useEffect, useState } from "react";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";

import { Client } from "../../utils/data-schema";
import { selectClientById, useClientStore } from "../../stores/clientsStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewClient from "./ViewClient";

export interface CardClientProps {
  clientId: Client["id"];
  onClick?: (clientId: Client["id"]) => void;
  selected?: boolean;
}

export function CardClient({ clientId, onClick, selected }: CardClientProps) {
  const { t } = useTranslation();
  const fetchClient = useClientStore((store) => store.fetchClient);

  const [fetchingClient, setFetchingClient] = useState(false);
  const [fetchClientResponse, setFetchClientResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewClientModalOpen, setViewClientModalOpen] = useState(false);

  const cachedClient = useClientStore(selectClientById(clientId));

  // fetchClient effect
  useEffect(() => {
    setFetchClientResponse(undefined);
    setFetchingClient(true);
    fetchClient(clientId)
      .then(setFetchClientResponse)
      .finally(() => setFetchingClient(false));
  }, [clientId, fetchClient]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius={1}
      paddingInline={1}
      width="100%"
      border="1px solid black"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      onClick={onClick && cachedClient ? () => onClick(clientId) : undefined}
    >
      {fetchingClient && <CircularProgress size="1.4em" sx={{ padding: 1 }} />}
      {!fetchingClient && !cachedClient && (
        <Typography color="error" fontWeight="bold" sx={{ padding: 1 }}>
          {fetchClientResponse?.error
            ? fetchClientResponse?.error.message
            : t("errorMessages.clientNotFound", { clientId: clientId })}
        </Typography>
      )}
      {!fetchingClient && cachedClient && (
        <>
          <Stack direction="row" spacing={1}>
            {selected != undefined && (
              <Checkbox
                checked={selected}
                sx={{ minWidth: "1px", padding: 0 }}
              />
            )}
            <Typography variant="body1">{cachedClient.name}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="textSecondary">
              {cachedClient.mobile}
            </Typography>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setViewClientModalOpen(true);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>

          <CustomModal
            title={t("titles.viewClient")}
            open={viewClientModalOpen}
            onClose={() => setViewClientModalOpen(false)}
          >
            <ViewClient clientId={clientId} />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
