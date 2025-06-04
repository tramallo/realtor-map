import { useEffect, useState } from "react";
import {
  Button,
  Stack,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  usePropertyStore,
  selectPropertyById,
} from "../../stores/propertiesStore";
import { Property } from "../../utils/data-schema";
import UpdateProperty from "./UpdateProperty";
import RealtorChip from "../RealtorChip";
import ClientChip from "../ClientChip";
import ComponentsField from "../ComponentsField";
import DeleteProperty from "./DeleteProperty";
import DateField from "../DateField";
import { OperationResponse } from "../../utils/helperFunctions";
import CustomModal from "../CustomModal";
import { CustomTextField } from "../CustomTextField";

export interface ViewPropertyProps {
  propertyId: Property["id"];
}

export default function ViewProperty({ propertyId }: ViewPropertyProps) {
  const { t } = useTranslation();
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [deletePropertyModalOpen, setDeletePropertyModalOpen] = useState(false);
  const [updatePropertyModalOpen, setUpdatePropertyModalOpen] = useState(false);

  const cachedProperty = usePropertyStore(selectPropertyById(propertyId));

  //fetchProperty effect
  useEffect(() => {
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
          {cachedProperty.address && (
            <CustomTextField
              value={cachedProperty.address ?? ""}
              label={t("entities.property.address")}
            />
          )}
          {cachedProperty.type && (
            <CustomTextField
              value={cachedProperty.type ?? ""}
              label={t("entities.property.type")}
            />
          )}
          {cachedProperty.state && (
            <CustomTextField
              value={cachedProperty.state ?? ""}
              label={t("entities.property.state")}
            />
          )}
          {cachedProperty.owner && (
            <ComponentsField
              label={t("entities.property.owner")}
              components={
                cachedProperty.owner
                  ? [<ClientChip clientId={cachedProperty.owner} />]
                  : []
              }
            />
          )}
          {cachedProperty.relatedRealtorIds && (
            <ComponentsField
              label={t("entities.property.relatedRealtorIds")}
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
          {cachedProperty.exclusiveRealtor && (
            <ComponentsField
              label={t("entities.property.exclusiveRealtor")}
              components={
                cachedProperty.exclusiveRealtor
                  ? [
                      <RealtorChip
                        realtorId={cachedProperty.exclusiveRealtor}
                      />,
                    ]
                  : []
              }
            />
          )}
          {cachedProperty.description && (
            <CustomTextField
              value={cachedProperty.description ?? ""}
              label={t("entities.property.description")}
              multiline
            />
          )}
          {cachedProperty.createdBy && (
            <CustomTextField
              label={t("entities.base.createdBy")}
              value={cachedProperty.createdBy}
              disabled
            />
          )}
          {cachedProperty.createdAt && (
            <DateField
              label={t("entities.base.createdAt")}
              value={cachedProperty.createdAt}
              disabled
            />
          )}
          {cachedProperty.updatedBy && (
            <CustomTextField
              label={t("entities.base.updatedBy")}
              value={cachedProperty.updatedBy}
              disabled
            />
          )}
          {cachedProperty.updatedAt && (
            <DateField
              label={t("entities.base.updatedAt")}
              value={cachedProperty.updatedAt}
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
              color={cachedProperty.deleted ? "success" : "error"}
              onClick={() => setDeletePropertyModalOpen(true)}
            >
              {cachedProperty.deleted
                ? t("buttons.restoreButton.label")
                : t("buttons.deleteButton.label")}
            </Button>
            {!cachedProperty.deleted && (
              <Button
                variant="contained"
                color="warning"
                onClick={() => setUpdatePropertyModalOpen(true)}
              >
                {t("buttons.updateButton.label")}
              </Button>
            )}
          </Stack>
          <CustomModal
            title={t("titles.deleteProperty")}
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
            title={t("titles.updateProperty")}
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
