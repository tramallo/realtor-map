import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import { CreatePersonDTO, createPersonDTO } from "../../utils/data-schema";
import { MemoForm } from "../form/Form";
import { MemoSubmitButton } from "../form/SubmitButton";
import {
  dateToTimestamp,
  useAppContext,
  useAuthContext,
} from "../../utils/helperFunctions";
import { usePersonStore } from "../../stores/personsStore";
import { FormTextField } from "../form/FormTextField";

export interface CreatePersonProps {
  prefillPerson?: Partial<CreatePersonDTO>;
  onCreate?: () => void;
}

export default function CreatePerson({
  prefillPerson,
  onCreate,
}: CreatePersonProps) {
  const { userSession } = useAuthContext();
  const { notifyUser } = useAppContext();
  const createPerson = usePersonStore((store) => store.createPerson);

  const [creatingPerson, setCreatingPerson] = useState(false);

  const prefillData = useMemo(
    () =>
      ({
        ...prefillPerson,
        createdBy: userSession?.user.id,
        createdAt: dateToTimestamp(new Date()),
      } as CreatePersonDTO),
    [prefillPerson, userSession]
  );

  const onSubmit = useCallback(
    async (newPersonData: CreatePersonDTO) => {
      setCreatingPerson(true);
      const createResponse = await createPerson(newPersonData);
      setCreatingPerson(false);

      if (createResponse.error) {
        notifyUser("Error. Person not created.");
        return;
      }

      notifyUser("Person created.");
      if (onCreate) {
        onCreate();
      }
    },
    [createPerson, notifyUser, onCreate]
  );

  return (
    <MemoForm<typeof createPersonDTO>
      schema={createPersonDTO}
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
            loading={creatingPerson}
            disabled={creatingPerson}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
