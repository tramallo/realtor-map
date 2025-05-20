import { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Client } from "../utils/data-schema";
import ComponentsField from "./ComponentsField";
import ClientChip from "./ClientChip";
import CustomModal from "./CustomModal";
import { SelectClient } from "./clients/SelectClient";

export interface ClientFieldProps {
  label?: string;
  selected: Array<Client["id"]>;
  onSelect: (newValue: Array<Client["id"]>) => void;
  multiple?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
}

export default function ClientField({
  label,
  selected,
  onSelect,
  multiple,
  errorMessage,
  readOnly,
}: ClientFieldProps) {
  const { t } = useTranslation();

  const [selectClientModalOpen, setSelectClientModalOpen] = useState(false);

  const removeSelected = useCallback(
    (clientId: Client["id"]) => {
      onSelect(
        selected.filter((selectedId: Client["id"]) => selectedId != clientId)
      );
    },
    [selected, onSelect]
  );

  const onClientSelect = useCallback(
    (newValue: Array<Client["id"]>) => {
      onSelect(newValue);
      setSelectClientModalOpen(false);
    },
    [onSelect]
  );

  return (
    <Box>
      <ComponentsField
        label={label}
        readOnly={readOnly}
        errorMessage={errorMessage}
        onActionButtonClick={
          !readOnly ? () => setSelectClientModalOpen(true) : undefined
        }
        components={selected.map((clientId: Client["id"], index: number) => (
          <ClientChip
            key={`chip-${clientId}-${index}`}
            clientId={clientId}
            onClose={readOnly ? undefined : () => removeSelected(clientId)}
          />
        ))}
      />
      <CustomModal
        title={t("titles.selectClient")}
        open={selectClientModalOpen}
        onClose={() => setSelectClientModalOpen(false)}
      >
        <SelectClient
          defaultSelected={selected}
          onSelect={onClientSelect}
          multiselect={multiple}
        />
      </CustomModal>
    </Box>
  );
}
