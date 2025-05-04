import { Chip, CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Property,
  propertyStates,
  propertyTypes,
  UpdatePropertyDTO,
  updatePropertySchema,
} from "../../utils/data-schema";
import {
  usePropertyStore,
  fetchByIdSelector,
} from "../../stores/propertiesStore";
import FormDateField from "../form/FormDateField";
import FormSelectField from "../form/FormSelectField";
import FormPersonField from "../form/FormPersonField";
import FormRealtorField from "../form/FormRealtorField";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  OperationResponse,
  useAppContext,
} from "../../utils/helperFunctions";
import FormLocationField from "../form/FormLocationField";

export interface UpdatePropertyProps {
  propertyId: Property["id"];
  onUpdate?: () => void;
}

export default function UpdateProperty({
  propertyId,
  onUpdate,
}: UpdatePropertyProps) {
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
      //TODO: use logged in user id
      updatedBy: 3,
      updatedAt: dateToTimestamp(new Date()),
    } as UpdatePropertyDTO;

    return cachedProperty
      ? { ...cachedProperty, ...updateMetadata }
      : updateMetadata;
  }, [cachedProperty]);

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
        notifyUser("Error. Property not updated.");
        return;
      }

      notifyUser("Property updated.");
      if (onUpdate) {
        onUpdate();
      }
    },
    [propertyId, cachedProperty, updateProperty, notifyUser, onUpdate]
  );

  //fetchProperty effect
  useEffect(() => {
    console.log(`UpdateProperty -> effect [fetchProperty]`);

    setFetchPropertyResponse(undefined);
    setFetchingProperty(true);
    fetchProperty(propertyId)
      .then(setFetchPropertyResponse)
      .finally(() => setFetchingProperty(false));
  }, [propertyId, fetchProperty]);

  return (
    <MemoForm schema={updatePropertySchema} prefillData={prefillData}>
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
              <Chip
                label="This property is deleted"
                color="error"
                variant="filled"
              />
            )}
            <FormLocationField
              label="Address"
              addressFieldName="address"
              coordinatesFieldName="coordinates"
            />
            <FormSelectField
              fieldName="type"
              label="Type"
              options={propertyTypes.map((propertyType) => ({
                label: propertyType,
                value: propertyType,
              }))}
            />
            <FormSelectField
              fieldName="state"
              label="State"
              options={propertyStates.map((propertyState) => ({
                label: propertyState,
                value: propertyState,
              }))}
            />
            <FormPersonField fieldName="ownerId" label="Owner" />
            <FormTextField
              fieldName="description"
              label="Description"
              multiline
            />
            <FormRealtorField
              fieldName="exclusiveRealtorId"
              label="Exclusive realtor"
            />
            <FormRealtorField
              fieldName="relatedRealtorIds"
              label="Associated realtors"
              multiple
            />
            <FormPersonField
              fieldName="updatedBy"
              label="Updated by"
              readOnly
            />
            <FormDateField fieldName="updatedAt" label="Updated at" readOnly />
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
            label="Confirm update"
            color="warning"
            loading={updatingProperty}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
