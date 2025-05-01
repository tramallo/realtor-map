import { useEffect, memo } from "react";
import {
  DefaultValues,
  FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";
import { ZodSchema, TypeOf as ZTypeOf } from "zod";

import { stripEmptyDataResolver } from "../../utils/stripEmptyDataResolver";

export interface FormProps<
  Schema extends ZodSchema,
  Data extends FieldValues = ZTypeOf<Schema>
> {
  schema: Schema;
  prefillData?: DefaultValues<Data>;
  children: React.ReactNode;
}

export function Form<
  Schema extends ZodSchema,
  Data extends FieldValues = ZTypeOf<Schema>
>({ schema, prefillData, children }: FormProps<Schema>) {
  const formData = useForm<Data>({
    resolver: stripEmptyDataResolver(schema),
    values: prefillData,
  });

  console.log(`Form -> render - data: ${JSON.stringify(formData.getValues())}`);

  //resetForm effect
  useEffect(() => {
    // reset form when prefillData changes, to show up-to-date data values
    if (!prefillData) {
      return;
    }

    console.log(
      `Form -> effect [resetForm] - prefillData: ${JSON.stringify(prefillData)}`
    );
    formData.reset(prefillData);
  }, [prefillData, formData]);

  return (
    <FormProvider {...formData}>
      <form>{children}</form>
    </FormProvider>
  );
}

export const MemoForm = memo(Form) as typeof Form;
