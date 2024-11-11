import {
  DefaultValues,
  FieldValues,
  FormProvider,
  useForm,
} from "react-hook-form";
import { ZodSchema, TypeOf as ZTypeOf } from "zod";

import "./Form.css";
import { customResolverFactory } from "../../utils/domainSchemas";
import React from "react";
import { Button } from "@mui/material";

export interface FormProps<
  Schema extends ZodSchema,
  Data extends FieldValues = ZTypeOf<Schema>
> {
  schema: Schema;
  onSubmit: (data: Data) => void;
  onCancel: () => void;
  prefillData?: DefaultValues<Data>;
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  children: React.ReactNode;
}

export default function Form<
  Schema extends ZodSchema,
  Data extends FieldValues = ZTypeOf<Schema>
>({
  schema,
  onSubmit,
  onCancel,
  prefillData,
  submitButtonLabel,
  cancelButtonLabel,
  children,
}: FormProps<Schema>) {
  const formData = useForm<Data>({
    resolver: customResolverFactory<Schema>(schema),
    defaultValues: prefillData,
  });

  return (
    <FormProvider {...formData}>
      <form className="form">
        <div className="form-fields">{children}</div>
        <div className="form-controls">
          <Button variant="outlined" onClick={onCancel}>
            {cancelButtonLabel ?? "Cancel"}
          </Button>
          <Button variant="contained" onClick={formData.handleSubmit(onSubmit)}>
            {submitButtonLabel ?? "Submit"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
