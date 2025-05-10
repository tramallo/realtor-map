import { useCallback, useState } from "react";
import { Box } from "@mui/material";

import { Property } from "../utils/data-schema";
import ComponentsField from "./ComponentsField";
import PropertyChip from "./PropertyChip";
import CustomModal from "./CustomModal";
import SearchProperties from "./properties/SearchProperties";

export interface PropertyFieldProps {
  label?: string;
  selected: Array<Property["id"]>;
  onSelect: (newValue: Array<Property["id"]>) => void;
  multiple?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
}

export default function PropertyField({
  label,
  selected,
  onSelect,
  multiple,
  errorMessage,
  readOnly,
}: PropertyFieldProps) {
  const [selectPropertyModalOpen, setSelectPropertyModalOpen] = useState(false);

  const removeSelected = useCallback(
    (propertyId: Property["id"]) => {
      onSelect(
        selected.filter(
          (selectedId: Property["id"]) => selectedId !== propertyId
        )
      );
    },
    [selected, onSelect]
  );

  const onPropertySelect = useCallback(
    (newValue: Array<Property["id"]>) => {
      onSelect(newValue);
      setSelectPropertyModalOpen(false);
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
          !readOnly ? () => setSelectPropertyModalOpen(true) : undefined
        }
        components={selected.map(
          (propertyId: Property["id"], index: number) => (
            <PropertyChip
              key={`chip-${propertyId}-${index}`}
              propertyId={propertyId}
              onClose={readOnly ? undefined : () => removeSelected(propertyId)}
            />
          )
        )}
      />
      <CustomModal
        title="Select property(s)"
        open={selectPropertyModalOpen}
        onClose={() => setSelectPropertyModalOpen(false)}
      >
        <SearchProperties
          defaultSelected={selected}
          onSelect={onPropertySelect}
          multiple={multiple}
        />
      </CustomModal>
    </Box>
  );
}
