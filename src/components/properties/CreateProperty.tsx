import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import {
  CreatePropertyDTO,
  createPropertySchema,
  propertyStates,
  propertyTypes,
} from "../../utils/data-schema";
import FormDateField from "../form/FormDateField";
import FormSelectField from "../form/FormSelectField";
import FormPersonField from "../form/FormPersonField";
import FormRealtorField from "../form/FormRealtorField";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import { MemoSubmitButton } from "../form/SubmitButton";
import { dateToTimestamp } from "../../utils/helperFunctions";
import FormLocationField from "../form/FormLocationField";
import { usePropertyStore } from "../../stores/propertiesStore";
import { useAppContext } from "../AppContext";

export interface CreatePropertyProps {
  prefillProperty?: Partial<CreatePropertyDTO>;
  onCreate?: () => void;
}

export default function CreateProperty({
  prefillProperty,
  onCreate,
}: CreatePropertyProps) {
  console.log(`CreateProperty -> render`);

  const { notifyUser } = useAppContext();
  const createProperty = usePropertyStore((store) => store.createProperty);

  const [creatingProperty, setCreatingProperty] = useState(false);

  const prefillData = useMemo(
    () => ({
      //TODO: use logged in user id
      ...prefillProperty,
      createdBy: 3,
      createdAt: dateToTimestamp(new Date()),
    }),
    [prefillProperty]
  );

  const submitProperty = useCallback(
    async (newPropertyData: CreatePropertyDTO) => {
      console.log(
        `CreateProperty -> submitProperty ${newPropertyData.address}`
      );

      setCreatingProperty(true);
      const createResponse = await createProperty(newPropertyData);
      setCreatingProperty(false);

      if (createResponse.error) {
        notifyUser("Error. Property not created.");
        return;
      }

      notifyUser("Property created.");
      if (onCreate) {
        onCreate();
      }
    },
    [createProperty, notifyUser, onCreate]
  );

  return (
    <MemoForm<typeof createPropertySchema>
      schema={createPropertySchema}
      prefillData={prefillData}
    >
      <Stack direction="column" spacing={2}>
        <FormLocationField
          addressFieldName="address"
          coordinatesFieldName="coordinates"
          label="Address"
          readOnly={creatingProperty}
        />
        <FormSelectField
          fieldName="type"
          label="Type"
          readOnly={creatingProperty}
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
          emptyOptionLabel="select a type"
        />
        <FormSelectField
          fieldName="state"
          label="State"
          readOnly={creatingProperty}
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
          emptyOptionLabel="select a state"
        />
        <FormPersonField
          fieldName="ownerId"
          label="Owner"
          readOnly={creatingProperty}
        />
        <FormTextField
          fieldName="description"
          label="Description"
          readOnly={creatingProperty}
          multiline
        />
        <FormRealtorField
          fieldName="exclusiveRealtorId"
          label="Exclusive realtor"
          readOnly={creatingProperty}
        />
        <FormRealtorField
          fieldName="relatedRealtorIds"
          label="Associated realtors"
          readOnly={creatingProperty}
          multiple
        />
        <FormPersonField fieldName="createdBy" label="Created by" readOnly />
        <FormDateField fieldName="createdAt" label="Created at" readOnly />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={submitProperty}
            label="Create"
            color="success"
            loading={creatingProperty}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
