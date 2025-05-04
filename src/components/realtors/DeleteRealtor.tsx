import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useRealtorStore, fetchByIdSelector } from "../../stores/realtorsStore";
import { Realtor } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
} from "../../utils/helperFunctions";

export interface DeleteRealtorProps {
  realtorId: Realtor["id"];
  onSoftDelete?: () => void;
  onRestore?: () => void;
}

export default function DeleteRealtor({
  realtorId,
  onSoftDelete,
  onRestore,
}: DeleteRealtorProps) {
  console.log(`DeleteRealtor -> render`);

  const { notifyUser } = useAppContext();
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);
  const updateRealtor = useRealtorStore((store) => store.updateRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingRealtor, setSoftDeletingRealtor] = useState(false);
  const [restoringRealtor, setRestoringRealtor] = useState(false);

  const cachedRealtor = useRealtorStore(fetchByIdSelector(realtorId));

  const softDeleteRealtor = useCallback(async () => {
    console.log(`DeleteRealtor -> softDeleteRealtor ${realtorId}`);

    setSoftDeletingRealtor(true);
    const softDeleteResponse = await updateRealtor(realtorId, {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    });
    setSoftDeletingRealtor(false);

    if (softDeleteResponse.error) {
      notifyUser("Error. Realtor not deleted.");
      return;
    }

    notifyUser("Realtor deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [realtorId, updateRealtor, notifyUser, onSoftDelete]);

  const restoreRealtor = useCallback(async () => {
    console.log(`DeleteRealtor -> restoreRealtor ${realtorId}`);

    setRestoringRealtor(true);
    const restoreResponse = await updateRealtor(realtorId, {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    });
    setRestoringRealtor(false);

    if (restoreResponse.error) {
      notifyUser("Error. Realtor not restored.");
      return;
    }

    notifyUser("Realtor restored.");
    if (onRestore) {
      onRestore();
    }
  }, [realtorId, updateRealtor, notifyUser, onRestore]);

  // fetchRealtor effect
  useEffect(() => {
    console.log(`DeleteRealtor -> effect [fetchRealtor]`);

    setFetchRealtorResponse(undefined);
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <Stack direction="column" spacing={2} padding={1}>
      {fetchingRealtor && (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      {!fetchingRealtor && !cachedRealtor && (
        <Typography
          variant="h6"
          align="center"
          color={fetchRealtorResponse?.error ? "error" : "warning"}
        >
          {fetchRealtorResponse?.error
            ? fetchRealtorResponse.error.message
            : `Realtor (id: ${realtorId}) not found`}
        </Typography>
      )}
      {!fetchingRealtor && cachedRealtor && (
        <>
          {cachedRealtor.deleted && (
            <Chip label="Deleted realtor" color="error" variant="outlined" />
          )}
          <TextField
            variant="outlined"
            label="Name"
            value={cachedRealtor.name ?? ""}
            fullWidth
            slotProps={{
              input: {
                sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }),
              },
            }}
          />
        </>
      )}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >
        {cachedRealtor?.deleted && (
          <Button
            variant="contained"
            color="success"
            onClick={restoreRealtor}
            disabled={
              fetchingRealtor || restoringRealtor || softDeletingRealtor
            }
          >
            {restoringRealtor ? <CircularProgress /> : "Restore"}
          </Button>
        )}
        {cachedRealtor?.deleted !== true && (
          <Button
            variant="contained"
            color="warning"
            onClick={softDeleteRealtor}
            disabled={
              fetchingRealtor || restoringRealtor || softDeletingRealtor
            }
          >
            {softDeletingRealtor ? <CircularProgress /> : "Delete"}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
