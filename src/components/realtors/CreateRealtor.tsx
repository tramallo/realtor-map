import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import { CreateRealtorDTO, createRealtorDTO } from "../../utils/data-schema";
import { dateToTimestamp } from "../../utils/helperFunctions";
import { useAppContext } from "../AppContext";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import { useRealtorStore } from "../../stores/realtorsStore";
import { FormTextField } from "../form/FormTextField";
import { useAuthStore } from "../../stores/authStore";

export interface CreateRealtorProps {
  prefillRealtor?: Partial<CreateRealtorDTO>;
  onCreate?: () => void;
}

export default function CreateRealtor({
  prefillRealtor,
  onCreate,
}: CreateRealtorProps) {
  const { t } = useTranslation();
  const userSession = useAuthStore(store => store.userSession);
  const { notifyUser } = useAppContext();
  const createRealtor = useRealtorStore((store) => store.createRealtor);

  const [creatingRealtor, setCreatingRealtor] = useState(false);

  const prefillData = useMemo(
    () =>
      ({
        ...prefillRealtor,
        createdBy: userSession?.user.id,
        createdAt: dateToTimestamp(new Date()),
      } as CreateRealtorDTO),
    [prefillRealtor, userSession]
  );

  const onSubmit = useCallback(
    async (newRealtorData: CreateRealtorDTO) => {
      setCreatingRealtor(true);
      const createResponse = await createRealtor(newRealtorData);
      setCreatingRealtor(false);

      if (createResponse.error) {
        notifyUser(t("errorMessages.realtorNotCreated"));
        return;
      }

      notifyUser(t("notifications.realtorCreated"));
      if (onCreate) {
        onCreate();
      }
    },
    [createRealtor, notifyUser, onCreate, t]
  );

  return (
    <MemoForm<typeof createRealtorDTO>
      schema={createRealtorDTO}
      prefillData={prefillData}
    >
      <Stack direction="column" spacing={2} padding={1}>
        <FormTextField fieldName="name" label="Name" />

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
            loading={creatingRealtor}
            disabled={creatingRealtor}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
