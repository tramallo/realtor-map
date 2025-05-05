import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { usePersonStore, fetchByIdSelector } from "../../stores/personsStore";
import { Person } from "../../utils/data-schema";
import DeletePerson from "./DeletePerson";
import UpdatePerson from "./UpdatePerson";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";

export interface ViewPersonProps {
  personId: Person["id"];
}

export default function ViewPerson({ personId }: ViewPersonProps) {
  const fetchPerson = usePersonStore((store) => store.fetchPerson);

  const [fetchingPerson, setFetchingPerson] = useState(false);
  const [fetchPersonResponse, setFetchPersonResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deletePersonModalOpen, setDeletePersonModalOpen] = useState(false);
  const [updatePersonModalOpen, setUpdatePersonModalOpen] = useState(false);

  const cachedPerson = usePersonStore(fetchByIdSelector(personId));

  //fetchPerson effect
  useEffect(() => {
    console.log(`ViewPerson -> effect [fetchPerson]`);

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
            <CustomTextField value={cachedPerson.name ?? ""} label="Name" />
          )}
          {cachedPerson.mobile && (
            <CustomTextField value={cachedPerson.mobile ?? ""} label="Mobile" />
          )}
          {cachedPerson.email && (
            <CustomTextField value={cachedPerson.email ?? ""} label="Email" />
          )}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <Button
              variant="contained"
              color={cachedPerson.deleted ? "success" : "error"}
              onClick={() => setDeletePersonModalOpen(true)}
            >
              {cachedPerson.deleted ? "Restore" : "Delete"}
            </Button>
            {!cachedPerson.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdatePersonModalOpen(true)}
              >
                Update
              </Button>
            )}
          </Stack>
          <CustomModal
            title={`Delete person: ${personId}`}
            open={deletePersonModalOpen}
            onClose={() => setDeletePersonModalOpen(false)}
          >
            <DeletePerson
              personId={personId}
              onSoftDelete={() => setDeletePersonModalOpen(false)}
              onRestore={() => setDeletePersonModalOpen(false)}
            />
          </CustomModal>
          <CustomModal
            title={`Update person: ${personId}`}
            open={updatePersonModalOpen}
            onClose={() => setUpdatePersonModalOpen(false)}
          >
            <UpdatePerson
              personId={personId}
              onUpdate={() => setUpdatePersonModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
