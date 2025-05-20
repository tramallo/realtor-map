import { memo, useMemo } from "react";
import { Button, CircularProgress } from "@mui/material";
import { FieldValues, useFormContext } from "react-hook-form";
import { ZodSchema, TypeOf as ZTypeOf } from "zod";
import { useTranslation } from "react-i18next";

export interface SubmitButtonProps<
  Schema extends ZodSchema,
  Data extends FieldValues = ZTypeOf<Schema>
> {
  onSubmit: (data: Data) => void;
  label?: string;
  color?: "primary" | "secondary" | "info" | "warning" | "error" | "success";
  loading?: boolean;
  disabled?: boolean;
}

export function SubmitButton<Schema extends ZodSchema>({
  onSubmit,
  label,
  color,
  loading,
  disabled,
}: SubmitButtonProps<Schema>) {
  const { t } = useTranslation();
  const { handleSubmit } = useFormContext<Schema>();

  const submit = useMemo(() => {
    return handleSubmit((data) => {
      onSubmit(data);
    });
  }, [handleSubmit, onSubmit]);

  return (
    <Button
      variant="contained"
      onClick={submit}
      color={color}
      disabled={loading || disabled}
    >
      {loading ? (
        <CircularProgress size="1.4em" />
      ) : (
        label ?? t("buttons.submitButton.label")
      )}
    </Button>
  );
}

export const MemoSubmitButton = memo(SubmitButton);
