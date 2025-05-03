import { useEffect, useState } from "react";
import { Chip, CircularProgress } from "@mui/material";

import { Person } from "../utils/data-schema";
import { OperationResponse } from "../utils/helperFunctions";
import ViewPerson from "./persons/ViewPerson";
import CustomModal from "./CustomModal";
import { usePersonStore, fetchByIdSelector } from "../stores/personsStore";

export interface PersonChipProps {
  personId: Person["id"];
  onClose?: () => void;
}

export default function PersonChip({ personId, onClose }: PersonChipProps) {
  const fetchPerson = usePersonStore((store) => store.fetchPerson);

  const [fetchingPerson, setFetchingPerson] = useState(false);
  const [fetchPersonResponse, setFetchPersonResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPersonModalOpen, setViewPersonModalOpen] = useState(false);

  const cachedPerson = usePersonStore(fetchByIdSelector(personId));

  //fetchPerson effect
  useEffect(() => {
    console.log(`PersonChip -> effect [fetchPerson]`);

    setFetchPersonResponse(undefined);
    setFetchingPerson(true);
    fetchPerson(personId)
      .then(setFetchPersonResponse)
      .finally(() => setFetchingPerson(false));
  }, [personId, fetchPerson]);

  return (
    <>
      <Chip
        icon={fetchingPerson ? <CircularProgress size="1ch" /> : undefined}
        label={
          !fetchPersonResponse
            ? ""
            : fetchPersonResponse.error
            ? "Error"
            : cachedPerson
            ? cachedPerson.name
            : "Not found"
        }
        color={
          !fetchPersonResponse
            ? "info"
            : fetchPersonResponse.error
            ? "error"
            : cachedPerson
            ? "success"
            : "warning"
        }
        onClick={() => setViewPersonModalOpen(true)}
        onDelete={onClose ? (!fetchingPerson ? onClose : undefined) : undefined}
        size="small"
      />
      <CustomModal
        title={`View person: ${personId}`}
        open={viewPersonModalOpen}
        onClose={() => setViewPersonModalOpen(false)}
      >
        <ViewPerson personId={personId} />
      </CustomModal>
    </>
  );
}
