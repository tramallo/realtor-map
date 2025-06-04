import { useEffect, useState } from "react";
import {
  Checkbox,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useTranslation } from "react-i18next";

import { Realtor } from "../../utils/data-schema";
import { selectRealtorById, useRealtorStore } from "../../stores/realtorsStore";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import ViewRealtor from "./ViewRealtor";

export interface CardRealtorProps {
  realtorId: Realtor["id"];
  onClick?: (realtorId: Realtor["id"]) => void;
  selected?: boolean;
}

export function CardRealtor({
  realtorId,
  onClick,
  selected,
}: CardRealtorProps) {
  const { t } = useTranslation();
  const fetchRealtor = useRealtorStore((store) => store.fetchRealtor);

  const [fetchingRealtor, setFetchingRealtor] = useState(false);
  const [fetchRealtorResponse, setFetchRealtorResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewRealtorModalOpen, setViewRealtorModalOpen] = useState(false);

  const realtor = useRealtorStore(selectRealtorById(realtorId));

  // fetchRealtor effect
  useEffect(() => {
    setFetchingRealtor(true);
    fetchRealtor(realtorId)
      .then(setFetchRealtorResponse)
      .finally(() => setFetchingRealtor(false));
  }, [realtorId, fetchRealtor]);

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      borderRadius={1}
      paddingInline={1}
      width="100%"
      border="1px solid black"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      onClick={onClick && realtor ? () => onClick(realtorId) : undefined}
    >
      {fetchingRealtor && <CircularProgress size="1.4em" sx={{ padding: 1 }} />}
      {!fetchingRealtor && !realtor && (
        <Typography color="error" fontWeight="bold" sx={{ padding: 1 }}>
          {fetchRealtorResponse?.error
            ? fetchRealtorResponse?.error.message
            : t("errorMessages.realtorNotFound", { realtorId: realtorId })}
        </Typography>
      )}
      {!fetchingRealtor && realtor && (
        <>
          <Stack direction="row" spacing={1}>
            {selected !== undefined && (
              <Checkbox
                checked={selected}
                sx={{ minWidth: "1px", padding: 0 }}
              />
            )}
            <Typography variant="body1">{realtor.name}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setViewRealtorModalOpen(true);
              }}
            >
              <VisibilityIcon />
            </IconButton>
          </Stack>

          <CustomModal
            title={t("titles.viewRealtor")}
            open={viewRealtorModalOpen}
            onClose={() => setViewRealtorModalOpen(false)}
          >
            <ViewRealtor realtorId={realtorId} />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
