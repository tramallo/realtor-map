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
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import { CustomTextField } from "../CustomTextField";

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
  console.log(`DeleteProperty -> render`);

  const { userSession } = useAuthContext();
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
      notifyUser("Error. Property not deleted.");
      return;
    }

    notifyUser("Property deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [propertyId, updateProperty, notifyUser, onSoftDelete, userSession]);

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
      notifyUser("Error. Property not restored.");
      return;
    }

    notifyUser("Property restored.");
    if (onRestore) {
      onRestore();
    }
  }, [propertyId, updateProperty, notifyUser, onRestore, userSession]);

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
            : `Property (id: ${propertyId}) not found`}
        </Typography>
      )}
      {!fetchingProperty && cachedProperty && (
        <>
          {cachedProperty.deleted && (
            <Chip label="Deleted" color="error" variant="outlined" />
          )}
          <CustomTextField
            label="address"
            value={cachedProperty.address ?? ""}
          />
          <CustomTextField label="type" value={cachedProperty.type} />
          {cachedProperty.owner && (
            <ComponentsField
              label="owner"
              components={[<ClientChip clientId={cachedProperty.owner} />]}
            />
          )}
          {cachedProperty.exclusiveRealtor && (
            <ComponentsField
              label="realtor"
              components={[
                <RealtorChip realtorId={cachedProperty.exclusiveRealtor} />,
              ]}
            />
          )}
          {cachedProperty.relatedRealtorIds && (
            <ComponentsField
              label="realtors"
              components={cachedProperty.relatedRealtorIds.map(
                (relatedRealtorId) => (
                  <RealtorChip realtorId={relatedRealtorId} />
                )
              )}
            />
          )}
          {cachedProperty.state && (
            <CustomTextField label="state" value={cachedProperty.state ?? ""} />
          )}
          {cachedProperty.description && (
            <CustomTextField
              label="description"
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
        {cachedProperty?.deleted && (
          <Button
            variant="contained"
            color="success"
            onClick={restoreProperty}
            disabled={
              !cachedProperty ||
              fetchingProperty ||
              restoringProperty ||
              softDeletingProperty
            }
          >
            {restoringProperty ? <CircularProgress size="1.4em" /> : "Restore"}
          </Button>
        )}
        {cachedProperty?.deleted !== true && (
          <Button
            variant="contained"
            color="warning"
            onClick={softDeleteProperty}
            disabled={
              fetchingProperty || restoringProperty || softDeletingProperty
            }
          >
            {softDeletingProperty ? (
              <CircularProgress size="1.4em" />
            ) : (
              "Delete"
            )}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}
