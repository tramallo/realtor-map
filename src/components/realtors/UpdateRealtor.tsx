import { useCallback, useEffect, useMemo, useState } from "react";
import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Realtor,
  UpdateRealtorDTO,
  updateRealtorDTO,
} from "../../utils/data-schema";
import { useRealtorStore, selectRealtorById } from "../../stores/realtorsStore";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import { FormTextField } from "../form/FormTextField";

export interface UpdateRealtorProps {
  realtorId: Realtor["id"];
  onUpdate?: () => void;
}

export default function UpdateRealtor({
  realtorId,
  onUpdate,
}: UpdateRealtorProps) {
  const { t } = useTranslation();
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);
  const updateRealtor = useRealtorStore((store) => store.updateRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingRealtor, setUpdatingRealtor] = useState(false);

  const cachedRealtor = useRealtorStore(selectRealtorById(realtorId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdateRealtorDTO;

    return cachedRealtor
      ? { ...cachedRealtor, ...updateMetadata }
      : updateMetadata;
  }, [cachedRealtor, userSession]);

  const submitUpdate = useCallback(
    async (updateRealtorData: UpdateRealtorDTO) => {
      console.log(
        `UpdateRealtor -> submitUpdate realtorId: ${cachedRealtor?.id}`
      );

      setUpdatingRealtor(true);
      const updateResponse = await updateRealtor(realtorId, updateRealtorData);
      setUpdatingRealtor(false);

      if (updateResponse.error) {
        notifyUser(t("errorMessages.realtorNotUpdated"));
        return;
      }

      notifyUser(t("notifications.realtorUpdated"));
      if (onUpdate) {
        onUpdate();
      }
    },
    [realtorId, cachedRealtor, updateRealtor, notifyUser, onUpdate, t]
  );

  // fetchRealtor effect
  useEffect(() => {
    setFetchRealtorResponse(undefined);
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <MemoForm schema={updateRealtorDTO} prefillData={prefillData}>
      <Stack spacing={2} padding={1}>
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
            <FormTextField
              fieldName="name"
              label={t("entities.realtor.name")}
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
            loading={updatingRealtor}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
