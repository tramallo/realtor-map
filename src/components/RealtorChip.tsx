import { Chip, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

import { Realtor } from "../utils/data-schema";
import ViewRealtor from "./realtors/ViewRealtor";
import { OperationResponse } from "../utils/helperFunctions";
import CustomModal from "./CustomModal";
import { useRealtorStore, fetchByIdSelector } from "../stores/realtorsStore";

export interface RealtorChipProps {
  realtorId: Realtor["id"];
  onClose?: () => void;
}

export default function RealtorChip({ realtorId, onClose }: RealtorChipProps) {
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewRealtorModalOpen, setViewRealtorModalOpen] = useState(false);

  const cachedRealtor = useRealtorStore(fetchByIdSelector(realtorId));

  //fetchRealtor effect
  useEffect(() => {
    console.log(`RealtorChip -> effect [fetchRealtor]`);

    setFetchRealtorResponse(undefined);
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <>
      <Chip
        icon={fetchingRealtor ? <CircularProgress size="1ch" /> : undefined}
        label={
          !fetchRealtorResponse
            ? ""
            : fetchRealtorResponse.error
            ? "Error"
            : cachedRealtor
            ? cachedRealtor.name
            : "Not found"
        }
        color={
          !fetchRealtorResponse
            ? "info"
            : fetchRealtorResponse.error
            ? "error"
            : cachedRealtor
            ? "success"
            : "warning"
        }
        onClick={() => setViewRealtorModalOpen(true)}
        onDelete={
          onClose ? (!fetchingRealtor ? onClose : undefined) : undefined
        }
        size="small"
      />
      <CustomModal
        title={`View realtor: ${realtorId}`}
        open={viewRealtorModalOpen}
        onClose={() => setViewRealtorModalOpen(false)}
      >
        <ViewRealtor realtorId={realtorId} />
      </CustomModal>
    </>
  );
}
