import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { usePersonStore, fetchByIdSelector } from "../../stores/personsStore";
import { Person, UpdatePersonDTO } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
import { CustomTextField } from "../CustomTextField";

export interface DeletePersonProps {
  personId: Person["id"];
  onSoftDelete?: () => void;
  onRestore?: () => void;
}

export default function DeletePerson({
  personId,
  onSoftDelete,
  onRestore,
}: DeletePersonProps) {
  console.log(`DeletePerson -> render`);

  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchPerson = usePersonStore((store) => store.fetchPerson);
  const updatePerson = usePersonStore((store) => store.updatePerson);

  const [fetchingPerson, setFetchingPerson] = useState(false);
  const [fetchPersonResponse, setFetchPersonResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingPerson, setSoftDeletingPerson] = useState(false);
  const [restoringPerson, setRestoringPerson] = useState(false);

  const cachedPerson = usePersonStore(fetchByIdSelector(personId));

  const softDeletePerson = useCallback(async () => {
    console.log(`DeletePerson -> softDeletePerson ${personId}`);

    setSoftDeletingPerson(true);
    const softDeleteResponse = await updatePerson(personId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    } as UpdatePersonDTO);
    setSoftDeletingPerson(false);

    if (softDeleteResponse.error) {
      notifyUser("Error. Person not deleted.");
      return;
    }

    notifyUser("Person deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [updatePerson, personId, notifyUser, onSoftDelete, userSession]);

  const restorePerson = useCallback(async () => {
    console.log(`DeletePerson -> restorePerson ${personId}`);

    setRestoringPerson(true);
    const restoreResponse = await updatePerson(personId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    } as UpdatePersonDTO);
    setRestoringPerson(false);

    if (restoreResponse.error) {
      notifyUser("Error. Person not restored.");
      return;
    }

    notifyUser("Person restored.");
    if (onRestore) {
      onRestore();
    }
  }, [personId, updatePerson, notifyUser, onRestore, userSession]);

  //fetchPerson effect
  useEffect(() => {
    console.log(`DeletePerson -> effect [fetchPerson]`);

    setFetchPersonResponse(undefined);
    setFetchingPerson(true);
    fetchPerson(personId)
      .then(setFetchPersonResponse)
      .finally(() => setFetchingPerson(false));
  }, [personId, fetchPerson]);

  return (
    <Stack spacing={2} padding={1}>
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
            <Chip label="Deleted" color="error" variant="outlined" />
          )}
          {cachedPerson.name && (
            <CustomTextField label="Name" value={cachedPerson.name ?? ""} />
          )}
          {cachedPerson.mobile && (
            <CustomTextField label="Mobile" value={cachedPerson.mobile ?? ""} />
          )}
          {cachedPerson.email && (
            <CustomTextField label="Email" value={cachedPerson.email ?? ""} />
          )}
        </>
      )}

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="end"
      >
        {cachedPerson?.deleted && (
          <Button
            variant="contained"
            color="success"
            onClick={restorePerson}
            disabled={fetchingPerson || restoringPerson || softDeletingPerson}
          >
            {restoringPerson ? <CircularProgress /> : "Restore"}
          </Button>
        )}
        {cachedPerson?.deleted !== true && (
          <Button
            variant="contained"
            color="warning"
            onClick={softDeletePerson}
            disabled={fetchingPerson || restoringPerson || softDeletingPerson}
          >
            {softDeletingPerson ? <CircularProgress /> : "Delete"}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
