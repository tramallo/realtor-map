import { useEffect, useState } from "react";
import { Chip, CircularProgress } from "@mui/material";

import { Client } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import ViewClient from "./clients/ViewClient";
import CustomModal from "./CustomModal";
import { useClientStore, fetchByIdSelector } from "../stores/clientsStore";

export interface ClientChipProps {
  clientId: Client["id"];
  onClose?: () => void;
}

export default function ClientChip({ clientId, onClose }: ClientChipProps) {
  const fetchClient = useClientStore((store) => store.fetchClient);

  const [fetchingClient, setFetchingClient] = useState(false);
  const [fetchClientResponse, setFetchClientResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewClientModalOpen, setViewClientModalOpen] = useState(false);

  const cachedClient = useClientStore(fetchByIdSelector(clientId));

  //fetchClient effect
  useEffect(() => {
    console.log(`ClientChip -> effect [fetchClient]`);

    setFetchClientResponse(undefined);
    setFetchingClient(true);
    fetchClient(clientId)
      .then(setFetchClientResponse)
      .finally(() => setFetchingClient(false));
  }, [clientId, fetchClient]);

  return (
    <>
      <Chip
        icon={fetchingClient ? <CircularProgress size="1ch" /> : undefined}
        label={
          !fetchClientResponse
            ? ""
            : fetchClientResponse.error
            ? "Error"
            : cachedClient
            ? cachedClient.name
            : "Not found"
        }
        color={
          !fetchClientResponse
            ? "info"
            : fetchClientResponse.error
            ? "error"
            : cachedClient
            ? "success"
            : "warning"
        }
        onClick={() => setViewClientModalOpen(true)}
        onDelete={onClose ? (!fetchingClient ? onClose : undefined) : undefined}
        size="small"
      />
      <CustomModal
        title={`View client: ${clientId}`}
        open={viewClientModalOpen}
        onClose={() => setViewClientModalOpen(false)}
      >
        <ViewClient clientId={clientId} />
      </CustomModal>
    </>
  );
}
