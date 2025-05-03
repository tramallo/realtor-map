import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Person,
  UpdatePersonDTO,
  updatePersonSchema,
} from "../../utils/data-schema";
import { usePersonStore, fetchByIdSelector } from "../../stores/personsStore";
import FormDateField from "../form/FormDateField";
import FormPersonField from "../form/FormPersonField";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAppContext } from "../AppContext";

export interface UpdatePersonProps {
  personId: Person["id"];
  onUpdate?: () => void;
}

export default function UpdatePerson({
  personId,
  onUpdate,
}: UpdatePersonProps) {
  const { notifyUser } = useAppContext();
  const fetchPerson = usePersonStore((store) => store.fetchPerson);
  const updatePerson = usePersonStore((store) => store.updatePerson);

  const [fetchingPerson, setFetchingPerson] = useState(false);
  const [fetchPersonResponse, setFetchPersonResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingPerson, setUpdatingPerson] = useState(false);

  const cachedPerson = usePersonStore(fetchByIdSelector(personId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdatePersonDTO;

    return cachedPerson
      ? { ...cachedPerson, ...updateMetadata }
      : updateMetadata;
  }, [cachedPerson]);

  const submitUpdate = useCallback(
    async (updatePersonData: UpdatePersonDTO) => {
      console.log(`UpdatePerson -> submitUpdate personId: ${cachedPerson?.id}`);

      setUpdatingPerson(true);
      const updateResponse = await updatePerson(personId, updatePersonData);
      setUpdatingPerson(false);

      if (updateResponse.error) {
        notifyUser("Error. Person not updated.");
        return;
      }

      notifyUser("Person updated.");
      if (onUpdate) {
        onUpdate();
      }
    },
    [personId, cachedPerson, updatePerson, notifyUser, onUpdate]
  );

  //fetchPerson effect
  useEffect(() => {
    console.log(`UpdatePerson -> effect [fetchPerson]`);

    setFetchPersonResponse(undefined);
    setFetchingPerson(true);
    fetchPerson(personId)
      .then(setFetchPersonResponse)
      .finally(() => setFetchingPerson(false));
  }, [personId, fetchPerson]);

  return (
    <MemoForm schema={updatePersonSchema} prefillData={prefillData}>
      <Stack spacing={2}>
        {fetchingPerson && (
          <Typography align="center">
            <CircularProgress />
          </Typography>
        )}
        {!fetchingPerson && !cachedPerson && (
          <Typography
            variant="h6"
            align="center"
            color={fetchPersonResponse?.error ? "error" : "warning"}
          >
            {fetchPersonResponse?.error
              ? fetchPersonResponse.error.message
              : `Person (id: ${personId}) not found`}
          </Typography>
        )}
        {!fetchingPerson && cachedPerson && (
          <>
            {cachedPerson.deleted && (
              <Chip label="Deleted person" color="error" variant="outlined" />
            )}
            <FormTextField fieldName="name" label="Name" />
            <FormTextField fieldName="mobile" label="Mobile" />
            <FormTextField fieldName="email" label="Email" />
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
            loading={updatingPerson}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
