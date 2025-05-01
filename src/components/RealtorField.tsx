import { useCallback, useState } from "react";
import { Box } from "@mui/material";

import { RealtorData } from "../utils/domainSchemas";
import ComponentsField from "./ComponentsField";
import RealtorChip from "./RealtorChip";
import CustomModal from "./CustomModal";
import ListRealtors from "./realtors/ListRealtors";

export interface RealtorFieldProps {
  label?: string;
  selected: Array<RealtorData["id"]>;
  onSelect: (newValue: Array<RealtorData["id"]>) => void;
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
    (realtorId: RealtorData["id"]) => {
      onSelect(
        selected.filter(
          (selectedId: RealtorData["id"]) => selectedId != realtorId
        )
      );
    },
    [selected, onSelect]
  );

  const onRealtorSelect = useCallback(
    (newValue: Array<RealtorData["id"]>) => {
      onSelect(newValue);
      setSelectRealtorModalOpen(false);
    },
    [onSelect]
  );

  return (
    <Box sx={{ display: "flex" }}>
      <ComponentsField
        label={label}
        readOnly={readOnly}
        errorMessage={errorMessage}
        onActionButtonClick={
          !readOnly ? () => setSelectRealtorModalOpen(true) : undefined
        }
        components={selected.map(
          (realtorId: RealtorData["id"], index: number) => (
            <RealtorChip
              key={`chip-${realtorId}-${index}`}
              realtorId={realtorId}
              onClose={readOnly ? undefined : () => removeSelected(realtorId)}
            />
          )
        )}
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
