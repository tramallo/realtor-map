import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { CreateClientDTO, createClientDTO } from "../../utils/data-schema";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import { dateToTimestamp } from "../../utils/helperFunctions";
import { useClientStore } from "../../stores/clientsStore";
import { FormTextField } from "../form/FormTextField";
import { useAppContext } from "../AppContext";
import { useAuthStore } from "../../stores/authStore";

export interface CreateClientProps {
  prefillClient?: Partial<CreateClientDTO>;
  onCreate?: () => void;
}

export default function CreateClient({
  prefillClient,
  onCreate,
}: CreateClientProps) {
  const { t } = useTranslation();
  const userSession = useAuthStore(store => store.userSession);
  const { notifyUser } = useAppContext();
  const createClient = useClientStore((store) => store.createClient);

  const [creatingClient, setCreatingClient] = useState(false);

  const prefillData = useMemo(
    () =>
      ({
        ...prefillClient,
        createdBy: userSession?.user.id,
        createdAt: dateToTimestamp(new Date()),
      } as CreateClientDTO),
    [prefillClient, userSession]
  );

  const onSubmit = useCallback(
    async (newClientData: CreateClientDTO) => {
      setCreatingClient(true);
      const createResponse = await createClient(newClientData);
      setCreatingClient(false);

      if (createResponse.error) {
        notifyUser(t("errorMessages.clientNotCreated"));
        return;
      }

      notifyUser(t("notifications.clientCreated"));
      if (onCreate) {
        onCreate();
      }
    },
    [createClient, notifyUser, onCreate, t]
  );

  return (
    <MemoForm<typeof createClientDTO>
      schema={createClientDTO}
      prefillData={prefillData}
    >
      <Stack spacing={2} padding={1}>
        <FormTextField fieldName="name" label={t("entities.client.name")} />
        <FormTextField fieldName="mobile" label={t("entities.client.mobile")} />
        <FormTextField fieldName="email" label={t("entities.client.email")} />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={onSubmit}
            label={t("buttons.confirmButton.label")}
            color="success"
            loading={creatingClient}
            disabled={creatingClient}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
