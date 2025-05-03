import { useEffect, useState } from "react";
import {
  Button,
  Stack,
  TextField,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  usePropertyStore,
  fetchByIdSelector,
} from "../../stores/propertiesStore";
import { Property } from "../../utils/data-schema";
import UpdateProperty from "./UpdateProperty";
import RealtorChip from "../RealtorChip";
import PersonChip from "../PersonChip";
import ComponentsField from "../ComponentsField";
import DeleteProperty from "./DeleteProperty";
import DateField from "../DateField";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";

export interface ViewPropertyProps {
  propertyId: Property["id"];
}

export default function ViewProperty({ propertyId }: ViewPropertyProps) {
  console.log(`ViewProperty -> render`);

  const fetchProperty = usePropertyStore((store) => store.fetchProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deletePropertyModalOpen, setDeletePropertyModalOpen] = useState(false);
  const [updatePropertyModalOpen, setUpdatePropertyModalOpen] = useState(false);

  const cachedProperty = usePropertyStore(fetchByIdSelector(propertyId));

  //fetchProperty effect
  useEffect(() => {
    console.log(`ViewProperty -> effect [fetchProperty]`);

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
          {cachedProperty.address && (
            <TextField
              variant="outlined"
              value={cachedProperty.address ?? ""}
              label="Address"
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          )}
          {cachedProperty.type && (
            <TextField
              variant="outlined"
              value={cachedProperty.type ?? ""}
              label="Type"
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          )}
          {cachedProperty.state && (
            <TextField
              variant="outlined"
              value={cachedProperty.state ?? ""}
              label="State"
              fullWidth
              slotProps={{ input: { readOnly: true } }}
            />
          )}
          {cachedProperty.ownerId && (
            <ComponentsField
              label="Owner"
              components={
                cachedProperty.ownerId
                  ? [<PersonChip personId={cachedProperty.ownerId} />]
                  : []
              }
            />
          )}
          {cachedProperty.relatedRealtorIds && (
            <ComponentsField
              label="Realtors"
              components={(cachedProperty.relatedRealtorIds ?? []).map(
                (realtorId, index) => (
                  <RealtorChip
                    key={`realtor-chip-${index}`}
                    realtorId={realtorId}
                  />
                )
              )}
            />
          )}
          {cachedProperty.exclusiveRealtorId && (
            <ComponentsField
              label="Exclusive realtor"
              components={
                cachedProperty.exclusiveRealtorId
                  ? [
                      <RealtorChip
                        realtorId={cachedProperty.exclusiveRealtorId}
                      />,
                    ]
                  : []
              }
            />
          )}
          {cachedProperty.description && (
            <TextField
              variant="outlined"
              value={cachedProperty.description ?? ""}
              label="Description"
              fullWidth
              multiline
              slotProps={{ input: { readOnly: true } }}
            />
          )}
          {cachedProperty.createdBy && (
            <ComponentsField
              label="Created by"
              components={[<PersonChip personId={cachedProperty.createdBy} />]}
            />
          )}
          {cachedProperty.createdAt && (
            <DateField
              label="Created at"
              value={cachedProperty.createdAt}
              readOnly
            />
          )}
          {cachedProperty.updatedBy && (
            <ComponentsField
              label="Updated by"
              components={[<PersonChip personId={cachedProperty.updatedBy} />]}
            />
          )}
          {cachedProperty.updatedAt && (
            <DateField
              label="Updated at"
              value={cachedProperty.updatedAt}
              readOnly
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
              color={cachedProperty.deleted ? "success" : "error"}
              onClick={() => setDeletePropertyModalOpen(true)}
            >
              {cachedProperty.deleted ? "Restore" : "Delete"}
            </Button>
            {!cachedProperty.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdatePropertyModalOpen(true)}
              >
                Update
              </Button>
            )}
          </Stack>
          <CustomModal
            title={`Delete property: ${propertyId}`}
            open={deletePropertyModalOpen}
            onClose={() => setDeletePropertyModalOpen(false)}
          >
            <DeleteProperty
              propertyId={propertyId}
              onSoftDelete={() => setDeletePropertyModalOpen(false)}
              onRestore={() => setDeletePropertyModalOpen(false)}
            />
          </CustomModal>
          <CustomModal
            title={`Update property: ${propertyId}`}
            open={updatePropertyModalOpen}
            onClose={() => setUpdatePropertyModalOpen(false)}
          >
            <UpdateProperty
              propertyId={propertyId}
              onUpdate={() => setUpdatePropertyModalOpen(false)}
            />
          </CustomModal>
        </>
      )}
    </Stack>
  );
}
