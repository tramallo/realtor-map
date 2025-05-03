import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import { CreatePersonDTO, createPersonSchema } from "../../utils/data-schema";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import FormDateField from "../form/FormDateField";
import { MemoSubmitButton } from "../form/SubmitButton";
import { dateToTimestamp } from "../../utils/helperFunctions";
import FormPersonField from "../form/FormPersonField";
import { usePersonStore } from "../../stores/personsStore";
import { useAppContext } from "../AppContext";

export interface CreatePersonProps {
  prefillPerson?: Partial<CreatePersonDTO>;
  onCreate?: () => void;
}

export default function CreatePerson({
  prefillPerson,
  onCreate,
}: CreatePersonProps) {
  const { notifyUser } = useAppContext();
  const createPerson = usePersonStore((store) => store.createPerson);

  const [creatingPerson, setCreatingPerson] = useState(false);

  const prefillData = useMemo(
    () => ({
      //TODO: use logged in user id
      ...prefillPerson,
      createdBy: 3,
      createdAt: dateToTimestamp(new Date()),
    }),
    [prefillPerson]
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
    <MemoForm<typeof createPersonSchema>
      schema={createPersonSchema}
      prefillData={prefillData}
    >
      <Stack direction="column" spacing={1}>
        <FormTextField fieldName="name" label="Name" />
        <FormTextField fieldName="mobile" label="Mobile" />
        <FormTextField fieldName="email" label="Email" />
        <FormPersonField fieldName="createdBy" label="Created by" readOnly />
        <FormDateField fieldName="createdAt" label="Created at" readOnly />

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
