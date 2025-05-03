import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  usePropertyStore,
  fetchByIdSelector,
} from "../../stores/propertiesStore";
import { Property } from "../../utils/data-schema";
import ComponentsField from "../ComponentsField";
import PersonChip from "../PersonChip";
import RealtorChip from "../RealtorChip";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAppContext } from "../AppContext";

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
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: true,
    });
    setSoftDeletingProperty(false);

    if (deleteResponse.error) {
      notifyUser("Error. Property not deleted.");
      return;
    }

    notifyUser("Property deleted.");
    if (onSoftDelete) {
      onSoftDelete();
    }
  }, [propertyId, updateProperty, notifyUser, onSoftDelete]);

  const restoreProperty = useCallback(async () => {
    console.log(`DeleteProperty -> restoreProperty ${propertyId}`);

    setRestoringProperty(true);
    const restoreResponse = await updateProperty(propertyId, {
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
      deleted: false,
    });
    setRestoringProperty(false);

    if (restoreResponse.error) {
      notifyUser("Error. Property not restored.");
      return;
    }

    notifyUser("Property restored.");
    if (onRestore) {
      onRestore();
    }
  }, [propertyId, updateProperty, notifyUser, onRestore]);

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
    <Stack spacing={2}>
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
            <Chip label="Deleted property" color="error" variant="outlined" />
          )}
          <TextField
            variant="outlined"
            label="address"
            value={cachedProperty.address ?? ""}
            fullWidth
          />
          <TextField
            variant="outlined"
            label="type"
            value={cachedProperty.type}
            fullWidth
          />
          {cachedProperty.ownerId && (
            <ComponentsField
              label="owner"
              components={[<PersonChip personId={cachedProperty.ownerId} />]}
            />
          )}
          {cachedProperty.exclusiveRealtorId && (
            <ComponentsField
              label="realtor"
              components={[
                <RealtorChip realtorId={cachedProperty.exclusiveRealtorId} />,
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
            <TextField
              variant="outlined"
              label="state"
              value={cachedProperty.state ?? ""}
              fullWidth
            />
          )}
          {cachedProperty.description && (
            <TextField
              variant="outlined"
              label="description"
              value={cachedProperty.description ?? ""}
              fullWidth
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
