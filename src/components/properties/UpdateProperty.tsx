import { useCallback, useEffect, useMemo, useState } from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  Property,
  propertyStates,
  propertyTypes,
  UpdatePropertyDTO,
  updatePropertyDTO,
} from "../../utils/data-schema";
import {
  usePropertyStore,
  fetchByIdSelector,
} from "../../stores/propertiesStore";
import FormSelectField from "../form/FormSelectField";
import FormPersonField from "../form/FormPersonField";
import FormRealtorField from "../form/FormRealtorField";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
} from "../../utils/helperFunctions";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import FormLocationField from "../form/FormLocationField";
import { FormTextField } from "../form/FormTextField";

export interface UpdatePropertyProps {
  propertyId: Property["id"];
  onUpdate?: () => void;
}

export default function UpdateProperty({
  propertyId,
  onUpdate,
}: UpdatePropertyProps) {
  const { t } = useTranslation();
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const fetchProperty = usePropertyStore((store) => store.fetchProperty);
  const updateProperty = usePropertyStore((store) => store.updateProperty);

  const [fetchingProperty, setFetchingProperty] = useState(false);
  const [fetchPropertyResponse, setFetchPropertyResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [updatingProperty, setUpdatingProperty] = useState(false);

  const cachedProperty = usePropertyStore(fetchByIdSelector(propertyId));

  const prefillData = useMemo(() => {
    const updateMetadata = {
      updatedBy: userSession?.user.id,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdatePropertyDTO;

    return cachedProperty
      ? { ...cachedProperty, ...updateMetadata }
      : updateMetadata;
  }, [cachedProperty, userSession]);

  const submitUpdate = useCallback(
    async (updatePropertyData: UpdatePropertyDTO) => {
      console.log(
        `UpdateProperty -> submitUpdate propertyId: ${cachedProperty?.id}`
      );

      setUpdatingProperty(true);
      const updateResponse = await updateProperty(
        propertyId,
        updatePropertyData
      );
      setUpdatingProperty(false);

      if (updateResponse.error) {
        notifyUser(t("errorMessages.propertyNotUpdated"));
        return;
      }

      notifyUser(t("notifications.propertyUpdated"));
      if (onUpdate) {
        onUpdate();
      }
    },
    [propertyId, cachedProperty, updateProperty, notifyUser, onUpdate, t]
  );

  //fetchProperty effect
  useEffect(() => {
    setFetchPropertyResponse(undefined);
    setFetchingProperty(true);
    fetchProperty(propertyId)
      .then(setFetchPropertyResponse)
      .finally(() => setFetchingProperty(false));
  }, [propertyId, fetchProperty]);

  return (
    <MemoForm schema={updatePropertyDTO} prefillData={prefillData}>
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
            <FormLocationField
              label={t("entities.property.address")}
              addressFieldName="address"
              coordinatesFieldName="coordinates"
            />
            <FormSelectField
              fieldName="type"
              label={t("entities.property.type")}
              options={propertyTypes.map((propertyType) => ({
                label: propertyType,
                value: propertyType,
              }))}
            />
            <FormSelectField
              fieldName="state"
              label={t("entities.property.state")}
              options={propertyStates.map((propertyState) => ({
                label: propertyState,
                value: propertyState,
              }))}
            />
            <FormPersonField fieldName="owner" label="Owner" />
            <FormTextField
              fieldName="description"
              label={t("entities.property.description")}
              multiline
            />
            <FormRealtorField
              fieldName="exclusiveRealtor"
              label={t("entities.property.exclusiveRealtor")}
            />
            <FormRealtorField
              fieldName="relatedRealtorIds"
              label={t("entities.property.relatedRealtorIds")}
              multiple
            />
          </>
        )}

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={submitUpdate}
            label={t("buttons.confirmButton.label")}
            color="warning"
            loading={updatingProperty}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
