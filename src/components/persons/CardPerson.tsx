import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { Person } from "../../utils/data-schema";
import { fetchByIdSelector, usePersonStore } from "../../stores/personsStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewPerson from "./ViewPerson";

export interface CardPersonProps {
  personId: Person["id"];
  onClick?: (personId: Person["id"]) => void;
}

export function CardPerson({ personId, onClick }: CardPersonProps) {
  const fetchPerson = usePersonStore((store) => store.fetchPerson);

  const [fetchingPerson, setFetchingPerson] = useState(false);
  const [fetchPersonResponse, setFetchPersonResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPersonModalOpen, setViewPersonModalOpen] = useState(false);

  const person = usePersonStore(fetchByIdSelector(personId));

  // fetchPerson effect
  useEffect(() => {
    setFetchingPerson(true);
    fetchPerson(personId)
      .then(setFetchPersonResponse)
      .finally(() => setFetchingPerson(false));
  }, [personId, fetchPerson]);

  return (
    <Box
      width="100%"
      borderRadius={2}
      paddingInline={1}
      sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      onClick={onClick ? () => onClick(personId) : undefined}
    >
      {fetchingPerson && <CircularProgress size="1.4em" />}
      {!fetchingPerson && !person && (
        <Typography color="error" sx={{ paddingInline: 2 }}>
          {fetchPersonResponse?.error
            ? fetchPersonResponse?.error.message
            : "Person not found"}
        </Typography>
      )}
      {!fetchingPerson && person && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography>{person.name}</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {person.mobile && (
              <Typography variant="body2">{person.mobile}</Typography>
            )}
            <IconButton onClick={() => setViewPersonModalOpen(true)}>
              <VisibilityIcon />
            </IconButton>
          </Stack>
        </Stack>
      )}

      <CustomModal
        title={`View Person: ${personId}`}
        open={viewPersonModalOpen}
        onClose={() => setViewPersonModalOpen(false)}
      >
        <ViewPerson personId={personId} />
      </CustomModal>
    </Box>
  );
}
