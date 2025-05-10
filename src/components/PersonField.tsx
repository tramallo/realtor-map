import { useCallback, useState } from "react";
import { Box } from "@mui/material";

import { Person } from "../utils/data-schema";
import ComponentsField from "./ComponentsField";
import PersonChip from "./PersonChip";
import CustomModal from "./CustomModal";
import SearchPersons from "./persons/SearchPersons";

export interface PersonFieldProps {
  label?: string;
  selected: Array<Person["id"]>;
  onSelect: (newValue: Array<Person["id"]>) => void;
  multiple?: boolean;
  errorMessage?: string;
  readOnly?: boolean;
}

export default function PersonField({
  label,
  selected,
  onSelect,
  multiple,
  errorMessage,
  readOnly,
}: PersonFieldProps) {
  const [selectPersonModalOpen, setSelectPersonModalOpen] = useState(false);

  const removeSelected = useCallback(
    (personId: Person["id"]) => {
      onSelect(
        selected.filter((selectedId: Person["id"]) => selectedId != personId)
      );
    },
    [selected, onSelect]
  );

  const onPersonSelect = useCallback(
    (newValue: Array<Person["id"]>) => {
      onSelect(newValue);
      setSelectPersonModalOpen(false);
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
          !readOnly ? () => setSelectPersonModalOpen(true) : undefined
        }
        components={selected.map((personId: Person["id"], index: number) => (
          <PersonChip
            key={`chip-${personId}-${index}`}
            personId={personId}
            onClose={readOnly ? undefined : () => removeSelected(personId)}
          />
        ))}
      />
      <CustomModal
        title="Select person(s)"
        open={selectPersonModalOpen}
        onClose={() => setSelectPersonModalOpen(false)}
      >
        <SearchPersons
          defaultSelected={selected}
          onSelect={onPersonSelect}
          multiselect={multiple}
        />
      </CustomModal>
    </Box>
  );
}
