import { useCallback, useState } from "react";
import { Box } from "@mui/material";

import { Realtor } from "../utils/data-schema";
import ComponentsField from "./ComponentsField";
import RealtorChip from "./RealtorChip";
import CustomModal from "./CustomModal";
import ListRealtors from "./realtors/ListRealtors";

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
          !readOnly ? () => setSelectRealtorModalOpen(true) : undefined
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
        title="Select realtor(s)"
        open={selectRealtorModalOpen}
        onClose={() => setSelectRealtorModalOpen(false)}
      >
        <ListRealtors
          defaultSelected={selected}
          onSelect={onRealtorSelect}
          multiple={multiple}
        />
      </CustomModal>
    </Box>
  );
}
