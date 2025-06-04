import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useRealtorStore, selectRealtorById } from "../../stores/realtorsStore";
import { Realtor, UpdateRealtorDTO } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import { CustomTextField } from "../CustomTextField";

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
  const { t } = useTranslation();
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);
  const updateRealtor = useRealtorStore((store) => store.updateRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingRealtor, setSoftDeletingRealtor] = useState(false);
  const [restoringRealtor, setRestoringRealtor] = useState(false);

  const cachedRealtor = useRealtorStore(selectRealtorById(realtorId));

  const softDeleteRealtor = useCallback(async () => {
    console.log(`DeleteRealtor -> softDeleteRealtor ${realtorId}`);

    setSoftDeletingRealtor(true);
    const softDeleteResponse = await updateRealtor(realtorId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    } as UpdateRealtorDTO);
    setSoftDeletingRealtor(false);

    if (softDeleteResponse.error) {
      notifyUser(t("errorMessages.realtorNotDeleted"));
      return;
    }

    notifyUser(t("notifications.realtorDeleted"));
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [realtorId, updateRealtor, notifyUser, onSoftDelete, userSession, t]);

  const restoreRealtor = useCallback(async () => {
    console.log(`DeleteRealtor -> restoreRealtor ${realtorId}`);

    setRestoringRealtor(true);
    const restoreResponse = await updateRealtor(realtorId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    } as UpdateRealtorDTO);
    setRestoringRealtor(false);

    if (restoreResponse.error) {
      notifyUser(t("errorMessages.realtorNotRestored"));
      return;
    }

    notifyUser(t("notifications.realtorRestored"));
    if (onRestore) {
      onRestore();
    }
  }, [realtorId, updateRealtor, notifyUser, onRestore, userSession, t]);

  // fetchRealtor effect
  useEffect(() => {
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
            : t("errorMessages.realtorNotFound", { realtorId: realtorId })}
        </Typography>
      )}
      {!fetchingRealtor && cachedRealtor && (
        <>
          {cachedRealtor.deleted && (
            <Chip
              label={t("entities.base.deleted")}
              color="error"
              variant="outlined"
            />
          )}
          <CustomTextField
            label={t("entities.realtor.name")}
            value={cachedRealtor.name ?? ""}
          />
        </>
      )}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >
        {cachedRealtor && (
          <Button
            variant="contained"
            color={cachedRealtor.deleted ? "success" : "error"}
            onClick={cachedRealtor.deleted ? restoreRealtor : softDeleteRealtor}
            disabled={
              fetchingRealtor || restoringRealtor || softDeletingRealtor
            }
          >
            {restoringRealtor || softDeletingRealtor ? (
              <CircularProgress />
            ) : cachedRealtor.deleted ? (
              t("buttons.restoreButton.label")
            ) : (
              t("buttons.deleteButton.label")
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
