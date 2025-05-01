import { useCallback, useMemo, useState } from "react";
import { Stack } from "@mui/material";

import {
  CreateRealtorData,
  createRealtorSchema,
  CreateRealtorSchema,
} from "../../utils/domainSchemas";
import { dateToTimestamp } from "../../utils/helperFunctions";
import { MemoForm } from "../form/Form";
import FormTextField from "../form/FormTextField";
import FormPersonField from "../form/FormPersonField";
import FormDateField from "../form/FormDateField";
import { MemoSubmitButton } from "../form/SubmitButton";
import { useRealtorStore } from "../../stores/realtorsStore";
import { useAppContext } from "../AppContext";

export interface CreateRealtorProps {
  prefillRealtor?: Partial<CreateRealtorData>;
  onCreate?: () => void;
}

export default function CreateRealtor({
  prefillRealtor,
  onCreate,
}: CreateRealtorProps) {
  const { notifyUser } = useAppContext();
  const createRealtor = useRealtorStore((store) => store.createRealtor);

  const [creatingRealtor, setCreatingRealtor] = useState(false);

  const prefillData = useMemo(
    () => ({
      //TODO: use logged in user id
      ...prefillRealtor,
      createdBy: 3,
      createdAt: dateToTimestamp(new Date()),
    }),
    [prefillRealtor]
  );

  const onSubmit = useCallback(
    async (newRealtorData: CreateRealtorData) => {
      setCreatingRealtor(true);
      const createResponse = await createRealtor(newRealtorData);
      setCreatingRealtor(false);

      if (createResponse.error) {
        notifyUser("Error. Realtor not created.");
        return;
      }

      notifyUser("Realtor created");
      if (onCreate) {
        onCreate();
      }
    },
    [createRealtor, notifyUser, onCreate]
  );

  return (
    <MemoForm<CreateRealtorSchema>
      schema={createRealtorSchema}
      prefillData={prefillData}
    >
      <Stack direction="column" spacing={1} padding={1}>
        <FormTextField fieldName="name" label="Name" />
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
            loading={creatingRealtor}
            disabled={creatingRealtor}
          />
        </Stack>
      </Stack>
    </MemoForm>
  );
}
