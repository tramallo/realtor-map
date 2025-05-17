import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import { CreateClientDTO, createClientDTO } from "../../utils/data-schema";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import { dateToTimestamp } from "../../utils/helperFunctions";
import { useClientStore } from "../../stores/clientsStore";
import { FormTextField } from "../form/FormTextField";
import { useAuthContext } from "../AuthContext";
import { useAppContext } from "../AppContext";

export interface CreateClientProps {
  prefillClient?: Partial<CreateClientDTO>;
  onCreate?: () => void;
}

export default function CreateClient({
  prefillClient,
  onCreate,
}: CreateClientProps) {
  const { userSession } = useAuthContext();
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
        notifyUser("Error. Client not created.");
        return;
      }

      notifyUser("Client created.");
      if (onCreate) {
        onCreate();
      }
    },
    [createClient, notifyUser, onCreate]
  );

  return (
    <MemoForm<typeof createClientDTO>
      schema={createClientDTO}
      prefillData={prefillData}
    >
      <Stack spacing={2} padding={1}>
        <FormTextField fieldName="name" label="Name" />
        <FormTextField fieldName="mobile" label="Mobile" />
        <FormTextField fieldName="email" label="Email" />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="end"
        >
          <MemoSubmitButton
            onSubmit={onSubmit}
            label="Create"
            color="success"
            loading={creatingClient}
            disabled={creatingClient}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
