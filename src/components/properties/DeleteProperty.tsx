import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  usePropertyStore,
  fetchByIdSelector,
} from "../../stores/propertiesStore";
import { Property, UpdatePropertyDTO } from "../../utils/data-schema";
import ComponentsField from "../ComponentsField";
import ClientChip from "../ClientChip";
import RealtorChip from "../RealtorChip";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAppContext } from "../AppContext";
import { CustomTextField } from "../CustomTextField";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../stores/authStore";

export interface DeletePropertyProps {
  propertyId: Property["id"];
  onSoftDelete?: () => void;
  onRestore?: () => void;
}

export default function DeleteProperty({
  propertyId,
  onSoftDelete,
  onRestore,
}: DeletePropertyProps) {
  const { t } = useTranslation();
  const userSession = useAuthStore(store => store.userSession);
  const { notifyUser } = useAppContext();
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);
  const updateProperty = usePropertyStore((store) => store.updateProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [softDeletingProperty, setSoftDeletingProperty] = useState(false);
  const [restoringProperty, setRestoringProperty] = useState(false);

  const cachedProperty = usePropertyStore(fetchByIdSelector(propertyId));

  const softDeleteProperty = useCallback(async () => {
    console.log(`DeleteProperty -> softDeleteProperty ${propertyId}`);

    setSoftDeletingProperty(true);
    const deleteResponse = await updateProperty(propertyId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    } as UpdatePropertyDTO);
    setSoftDeletingProperty(false);

    if (deleteResponse.error) {
      notifyUser(t("errorMessages.propertyNotDeleted"));
      return;
    }

    notifyUser(t("notifications.propertyDeleted"));
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [propertyId, updateProperty, notifyUser, onSoftDelete, userSession, t]);

  const restoreProperty = useCallback(async () => {
    console.log(`DeleteProperty -> restoreProperty ${propertyId}`);

    setRestoringProperty(true);
    const restoreResponse = await updateProperty(propertyId, {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    } as UpdatePropertyDTO);
    setRestoringProperty(false);

    if (restoreResponse.error) {
      notifyUser(t("errorMessages.propertyNotRestored"));
      return;
    }

    notifyUser(t("notifications.propertyRestored"));
    if (onRestore) {
      onRestore();
    }
  }, [propertyId, updateProperty, notifyUser, onRestore, userSession, t]);

  //fetchProperty effect
  useEffect(() => {
    console.log(`DeleteProperty -> effect [fetchProperty]`);

    setFetchPropertyResponse(undefined);
    setFetchingProperty(true);
    fetchProperty(propertyId)
      .then(setFetchPropertyResponse)
      .finally(() => setFetchingProperty(false));
  }, [propertyId, fetchProperty]);

  return (
    <Stack spacing={2} padding={1}>
      {fetchingProperty && (
        <Typography align="center">
          <CircularProgress />
        </Typography>
      )}
      {!fetchingProperty && !cachedProperty && (
        <Typography
          variant="h6"
          align="center"
          color={fetchPropertyResponse?.error ? "error" : "warning"}
        >
          {fetchPropertyResponse?.error
            ? fetchPropertyResponse.error.message
            : t("errorMessages.propertyNotFound", { propertyId: propertyId })}
        </Typography>
      )}
      {!fetchingProperty && cachedProperty && (
        <>
          {cachedProperty.deleted && (
            <Chip
              label={t("entities.base.deleted")}
              color="error"
              variant="outlined"
            />
          )}
          <CustomTextField
            label={t("entities.property.address")}
            value={cachedProperty.address ?? ""}
          />
          <CustomTextField
            label={t("entities.property.type")}
            value={cachedProperty.type}
          />
          {cachedProperty.owner && (
            <ComponentsField
              label={t("entities.property.owner")}
              components={[<ClientChip clientId={cachedProperty.owner} />]}
            />
          )}
          {cachedProperty.exclusiveRealtor && (
            <ComponentsField
              label={t("entities.property.exclusiveRealtor")}
              components={[
                <RealtorChip realtorId={cachedProperty.exclusiveRealtor} />,
              ]}
            />
          )}
          {cachedProperty.relatedRealtorIds && (
            <ComponentsField
              label={t("entities.property.relatedRealtorIds")}
              components={cachedProperty.relatedRealtorIds.map(
                (relatedRealtorId) => (
                  <RealtorChip realtorId={relatedRealtorId} />
                )
              )}
            />
          )}
          {cachedProperty.state && (
            <CustomTextField
              label={t("entities.property.state")}
              value={cachedProperty.state ?? ""}
            />
          )}
          {cachedProperty.description && (
            <CustomTextField
              label={t("entities.property.description")}
              value={cachedProperty.description ?? ""}
              multiline
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
        {cachedProperty && (
          <Button
            variant="contained"
            color={cachedProperty.deleted ? "success" : "error"}
            onClick={
              cachedProperty.deleted ? restoreProperty : softDeleteProperty
            }
            disabled={
              !cachedProperty ||
              fetchingProperty ||
              restoringProperty ||
              softDeletingProperty
            }
          >
            {restoringProperty || softDeletingProperty ? (
              <CircularProgress size="1.4em" />
            ) : cachedProperty.deleted ? (
              t("buttons.restoreButton.label")
            ) : (
              t("buttons.deleteButton.label")
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
