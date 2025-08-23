import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
  CreatePropertyDTO,
  createPropertyDTO,
  propertyStates,
  propertyTypes,
} from "../../utils/data-schema";
import FormSelectField from "../form/FormSelectField";
import FormPersonField from "../form/FormPersonField";
import FormRealtorField from "../form/FormRealtorField";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import { dateToTimestamp } from "../../utils/helperFunctions";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";
import FormLocationField from "../form/FormLocationField";
import { usePropertyStore } from "../../stores/propertiesStore";
import { FormTextField } from "../form/FormTextField";

export interface CreatePropertyProps {
  prefillProperty?: Partial<CreatePropertyDTO>;
  onCreate?: () => void;
}

export default function CreateProperty({
  prefillProperty,
  onCreate,
}: CreatePropertyProps) {
  const { t } = useTranslation();
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const createProperty = usePropertyStore((store) => store.createProperty);

  const [creatingProperty, setCreatingProperty] = useState(false);

  const prefillData = useMemo(
    () =>
      ({
        ...prefillProperty,
        createdBy: userSession?.user.id,
        createdAt: dateToTimestamp(new Date()),
      } as CreatePropertyDTO),
    [prefillProperty, userSession]
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
        notifyUser(t("errorMessages.propertyNotCreated"));
        return;
      }

      notifyUser(t("notifications.propertyCreated"));
      if (onCreate) {
        onCreate();
      }
    },
    [createProperty, notifyUser, onCreate, t]
  );

  return (
    <MemoForm<typeof createPropertyDTO>
      schema={createPropertyDTO}
      prefillData={prefillData}
    >
      <Stack spacing={2} padding={1}>
        <FormLocationField
          addressFieldName="address"
          coordinatesFieldName="coordinates"
          label={t("entities.property.address")}
          readOnly={creatingProperty}
        />
        <FormSelectField
          fieldName="type"
          label={t("entities.property.type")}
          readOnly={creatingProperty}
          options={propertyTypes.map((propertyType) => ({
            label: propertyType,
            value: propertyType,
          }))}
          emptyOptionLabel="_"
        />
        <FormSelectField
          fieldName="state"
          label={t("entities.property.state")}
          readOnly={creatingProperty}
          options={propertyStates.map((propertyState) => ({
            label: propertyState,
            value: propertyState,
          }))}
          emptyOptionLabel="_"
        />
        <FormPersonField
          fieldName="owner"
          label={t("entities.property.owner")}
          readOnly={creatingProperty}
        />
        <FormTextField
          fieldName="description"
          label={t("entities.property.description")}
          disabled={creatingProperty}
          multiline
        />
        <FormRealtorField
          fieldName="exclusiveRealtor"
          label={t("entities.property.exclusiveRealtor")}
          readOnly={creatingProperty}
        />
        <FormRealtorField
          fieldName="relatedRealtorIds"
          label={t("entities.property.relatedRealtorIds")}
          readOnly={creatingProperty}
          multiple
        />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={submitProperty}
            label={t("buttons.confirmButton.label")}
            color="success"
            loading={creatingProperty}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
