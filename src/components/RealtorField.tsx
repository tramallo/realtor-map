import { useCallback, useState } from "react";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Realtor } from "../utils/data-schema";
import ComponentsField from "./ComponentsField";
import RealtorChip from "./RealtorChip";
import CustomModal from "./CustomModal";
import { SelectRealtor } from "./realtors/SelectRealtor";

export interface RealtorFieldProps {
  label?: string;
  selected: Array<Realtor["id"]>;
  onSelect: (newValue: Array<Realtor["id"]>) => void;
  multiple?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
}

export default function RealtorField({
  label,
  selected,
  onSelect,
  multiple,
  errorMessage,
  readOnly,
}: RealtorFieldProps) {
  const { t } = useTranslation();

  const [selectRealtorModalOpen, setSelectRealtorModalOpen] = useState(false);

  const removeSelected = useCallback(
    (realtorId: Realtor["id"]) => {
      onSelect(
        selected.filter((selectedId: Realtor["id"]) => selectedId != realtorId)
      );
    },
    [selected, onSelect]
  );

  const onRealtorSelect = useCallback(
    (newValue: Array<Realtor["id"]>) => {
      onSelect(newValue);
      setSelectRealtorModalOpen(false);
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
          readOnly != true ? () => setSelectRealtorModalOpen(true) : undefined
        }
        components={selected.map((realtorId: Realtor["id"], index: number) => (
          <RealtorChip
            key={`chip-${realtorId}-${index}`}
            realtorId={realtorId}
            onClose={readOnly ? undefined : () => removeSelected(realtorId)}
          />
        ))}
      />
      <CustomModal
        title={t("titles.selectRealtor")}
        open={selectRealtorModalOpen}
        onClose={() => setSelectRealtorModalOpen(false)}
      >
        <SelectRealtor
          defaultSelected={selected}
          onSelect={onRealtorSelect}
          multiselect={multiple}
        />
      </CustomModal>
    </Box>
  );
}
