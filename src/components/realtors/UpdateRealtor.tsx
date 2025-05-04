import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Realtor,
  UpdateRealtorDTO,
  updateRealtorSchema,
} from "../../utils/data-schema";
import { useRealtorStore, fetchByIdSelector } from "../../stores/realtorsStore";
import FormDateField from "../form/FormDateField";
import FormPersonField from "../form/FormPersonField";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
} from "../../utils/helperFunctions";

export interface UpdateRealtorProps {
  realtorId: Realtor["id"];
  onUpdate?: () => void;
}

export default function UpdateRealtor({
  realtorId,
  onUpdate,
}: UpdateRealtorProps) {
  const { notifyUser } = useAppContext();
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);
  const updateRealtor = useRealtorStore((store) => store.updateRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingRealtor, setUpdatingRealtor] = useState(false);

  const cachedRealtor = useRealtorStore(fetchByIdSelector(realtorId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdateRealtorDTO;

    return cachedRealtor
      ? { ...cachedRealtor, ...updateMetadata }
      : updateMetadata;
  }, [cachedRealtor]);

  const submitUpdate = useCallback(
    async (updateRealtorData: UpdateRealtorDTO) => {
      console.log(
        `UpdateRealtor -> submitUpdate realtorId: ${cachedRealtor?.id}`
      );

      setUpdatingRealtor(true);
      const updateResponse = await updateRealtor(realtorId, updateRealtorData);
      setUpdatingRealtor(false);

      if (updateResponse.error) {
        notifyUser("Error. Realtor not updated.");
        return;
      }

      notifyUser("Realtor updated");
      if (onUpdate) {
        onUpdate();
      }
    },
    [realtorId, cachedRealtor, updateRealtor, notifyUser, onUpdate]
  );

  // fetchRealtor effect
  useEffect(() => {
    console.log(`UpdateRealtor -> effect [fetchRealtor]`);

    setFetchRealtorResponse(undefined);
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <MemoForm schema={updateRealtorSchema} prefillData={prefillData}>
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
              : `Realtor (id: ${realtorId}) not found`}
          </Typography>
        )}
        {!fetchingRealtor && cachedRealtor && (
          <>
            {cachedRealtor.deleted && (
              <Chip
                label="This realtor is deleted"
                color="error"
                variant="filled"
              />
            )}
            <FormTextField fieldName="name" label="Name" />
            <FormPersonField
              fieldName="updatedBy"
              label="Updated by"
              readOnly
            />
            <FormDateField fieldName="updatedAt" label="Updated at" readOnly />
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
            loading={updatingRealtor}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
