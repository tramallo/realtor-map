import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { usePersonStore, fetchByIdSelector } from "../../stores/personsStore";
import { Person } from "../../utils/data-schema";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAppContext } from "../AppContext";

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
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    });
    setSoftDeletingPerson(false);

    if (softDeleteResponse.error) {
      notifyUser("Error. Person not deleted.");
      return;
    }

    notifyUser("Person deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [updatePerson, personId, notifyUser, onSoftDelete]);

  const restorePerson = useCallback(async () => {
    console.log(`DeletePerson -> restorePerson ${personId}`);

    setRestoringPerson(true);
    const restoreResponse = await updatePerson(personId, {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    });
    setRestoringPerson(false);

    if (restoreResponse.error) {
      notifyUser("Error. Person not restored.");
      return;
    }

    notifyUser("Person restored");
    if (onRestore) {
      onRestore();
    }
  }, [personId, updatePerson, notifyUser, onRestore]);

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
            <Chip label="Deleted person" color="error" variant="outlined" />
          )}
          {cachedPerson.name && (
            <TextField
              variant="outlined"
              label="Name"
              value={cachedPerson.name ?? ""}
              fullWidth
              slotProps={{ input: { sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }) } }}
            />
          )}
          {cachedPerson.mobile && (
            <TextField
              variant="outlined"
              label="Mobile"
              value={cachedPerson.mobile ?? ""}
              fullWidth
              slotProps={{ input: { sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }) } }}
            />
          )}
          {cachedPerson.email && (
            <TextField
              variant="outlined"
              label="Email"
              value={cachedPerson.email ?? ""}
              fullWidth
              slotProps={{ input: { sx: (theme) => ({ backgroundColor: theme.palette.grey[200] }) } }}
            />
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
