import { useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { useRealtorStore, fetchByIdSelector } from "../../stores/realtorsStore";
import { Realtor } from "../../utils/data-schema";
import DeleteRealtor from "./DeleteRealtor";
import UpdateRealtor from "./UpdateRealtor";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";
import DateField from "../DateField";

export interface ViewRealtorProps {
  realtorId: Realtor["id"];
}

export default function ViewRealtor({ realtorId }: ViewRealtorProps) {
  const { t } = useTranslation();
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
            : t("errorMessages.realtorNotFound", { realtorId: realtorId })}
        </Typography>
      )}
      {!fetchingRealtor && cachedRealtor && (
        <>
          {cachedRealtor.deleted && (
            <Chip
              label={t("entities.base.deleted")}
              color="error"
              variant="outlined"
            />
          )}
          {cachedRealtor.name && (
            <CustomTextField
              value={cachedRealtor.name ?? ""}
              label={t("entities.realtor.name")}
            />
          )}
          {cachedRealtor.createdBy && (
            <CustomTextField
              label={t("entities.base.createdBy")}
              value={cachedRealtor.createdBy}
              disabled
            />
          )}
          {cachedRealtor.createdAt && (
            <DateField
              label={t("entities.base.createdAt")}
              value={cachedRealtor.createdAt}
              disabled
            />
          )}
          {cachedRealtor.updatedBy && (
            <CustomTextField
              label={t("entities.base.updatedBy")}
              value={cachedRealtor.updatedBy}
              disabled
            />
          )}
          {cachedRealtor.updatedAt && (
            <DateField
              label={t("entities.base.updatedAt")}
              value={cachedRealtor.updatedAt}
              disabled
            />
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
              {cachedRealtor.deleted
                ? t("buttons.restoreButton.label")
                : t("buttons.deleteButton.label")}
            </Button>
            {!cachedRealtor.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdateRealtorModalOpen(true)}
              >
                {t("buttons.updateButton.label")}
              </Button>
            )}
          </Stack>
          <CustomModal
            title={t("titles.deleteRealtor")}
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
            title={t("titles.updateRealtor")}
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
