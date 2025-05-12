import { CircularProgress, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
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
              : `Property (id: ${propertyId}) not found`}
          </Typography>
        )}
        {!fetchingProperty && cachedProperty && (
          <>
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
            <FormPersonField fieldName="owner" label="Owner" />
            <FormTextField
              fieldName="description"
              label="Description"
              multiline
            />
            <FormRealtorField
              fieldName="exclusiveRealtor"
              label="Exclusive realtor"
            />
            <FormRealtorField
              fieldName="relatedRealtorIds"
              label="Associated realtors"
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
            label="Confirm update"
            color="warning"
            loading={updatingProperty}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
