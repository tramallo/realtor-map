import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { Realtor } from "../../utils/data-schema";
import { fetchByIdSelector, useRealtorStore } from "../../stores/realtorsStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewRealtor from "./ViewRealtor";

export interface CardRealtorProps {
  realtorId: Realtor["id"];
}

export function CardRealtor({ realtorId }: CardRealtorProps) {
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewRealtorModalOpen, setViewRealtorModalOpen] = useState(false);

  const realtor = useRealtorStore(fetchByIdSelector(realtorId));

  // fetchRealtor effect
  useEffect(() => {
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <Box width="100%">
      {fetchingRealtor && <CircularProgress size="1.4em" />}
      {!fetchingRealtor && !realtor && (
        <Typography color="error" sx={{ paddingInline: 2 }}>
          {fetchRealtorResponse?.error
            ? fetchRealtorResponse?.error.message
            : "Realtor not found"}
        </Typography>
      )}
      {!fetchingRealtor && realtor && (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography>{realtor.name}</Typography>
          <IconButton onClick={() => setViewRealtorModalOpen(true)}>
            <VisibilityIcon />
          </IconButton>
        </Stack>
      )}

      <CustomModal
        title={`View Realtor: ${realtor?.name || realtorId}`}
        open={viewRealtorModalOpen}
        onClose={() => setViewRealtorModalOpen(false)}
      >
        <ViewRealtor realtorId={realtorId} />
      </CustomModal>
    </Box>
  );
}
