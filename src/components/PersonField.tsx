import { useCallback, useState } from "react";
import { Box } from "@mui/material";

import { PersonData } from "../utils/domainSchemas";
import ComponentsField from "./ComponentsField";
import PersonChip from "./PersonChip";
import CustomModal from "./CustomModal";
import ListPersons from "./persons/ListPersons";

export interface PersonFieldProps {
  label?: string;
  selected: Array<PersonData["id"]>;
  onSelect: (newValue: Array<PersonData["id"]>) => void;
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
    (personId: PersonData["id"]) => {
      onSelect(
        selected.filter(
          (selectedId: PersonData["id"]) => selectedId != personId
        )
      );
    },
    [selected, onSelect]
  );

  const onPersonSelect = useCallback(
    (newValue: Array<PersonData["id"]>) => {
      onSelect(newValue);
      setSelectPersonModalOpen(false);
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
          !readOnly ? () => setSelectPersonModalOpen(true) : undefined
        }
        components={selected.map(
          (personId: PersonData["id"], index: number) => (
            <PersonChip
              key={`chip-${personId}-${index}`}
              personId={personId}
              onClose={readOnly ? undefined : () => removeSelected(personId)}
            />
          )
        )}
      />
      <CustomModal
        title="Select person(s)"
        open={selectPersonModalOpen}
        onClose={() => setSelectPersonModalOpen(false)}
      >
        <ListPersons
          defaultSelected={selected}
          onSelect={onPersonSelect}
          multiple={multiple}
        />
      </CustomModal>
    </Box>
  );
}
