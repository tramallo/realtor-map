import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import { useRealtorStore, fetchByIdSelector } from "../../stores/realtorsStore";
import { Realtor } from "../../utils/data-schema";
import DeleteRealtor from "./DeleteRealtor";
import UpdateRealtor from "./UpdateRealtor";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";

export interface ViewRealtorProps {
  realtorId: Realtor["id"];
}

export default function ViewRealtor({ realtorId }: ViewRealtorProps) {
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deleteRealtorModalOpen, setDeleteRealtorModalOpen] = useState(false);
  const [updateRealtorModalOpen, setUpdateRealtorModalOpen] = useState(false);

  const cachedRealtor = useRealtorStore(fetchByIdSelector(realtorId));

  // fetchRealtor effect
  useEffect(() => {
    console.log(`ViewRealtor -> effect [fetchRealtor]`);

    setFetchRealtorResponse(undefined);
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
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
            <Chip label="Deleted" color="error" variant="outlined" />
          )}
          {cachedRealtor.name && (
            <CustomTextField value={cachedRealtor.name ?? ""} label="Name" />
          )}

          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="end"
          >
            <Button
              variant="contained"
              color={cachedRealtor.deleted ? "success" : "error"}
              onClick={() => setDeleteRealtorModalOpen(true)}
            >
              {cachedRealtor.deleted ? "Restore" : "Delete"}
            </Button>
            {!cachedRealtor.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateRealtorModalOpen(true)}
              >
                Update
              </Button>
            )}
          </Stack>
          <CustomModal
            title={`Delete Realtor: ${realtorId}`}
            open={deleteRealtorModalOpen}
            onClose={() => setDeleteRealtorModalOpen(false)}
          >
            <DeleteRealtor
              realtorId={realtorId}
              onSoftDelete={() => setDeleteRealtorModalOpen(false)}
              onRestore={() => setDeleteRealtorModalOpen(false)}
            />
          </CustomModal>
          <CustomModal
            title={`Update Realtor: ${realtorId}`}
            open={updateRealtorModalOpen}
            onClose={() => setUpdateRealtorModalOpen(false)}
          >
            <UpdateRealtor
              realtorId={realtorId}
              onUpdate={() => setUpdateRealtorModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
