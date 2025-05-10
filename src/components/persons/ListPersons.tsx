import { useCallback } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";

import { Person } from "../../utils/data-schema";
import { CardPerson } from "./CardPerson";
import ComponentsField from "../ComponentsField";
import PersonChip from "../PersonChip";

export type ListPersonsProps = Omit<StackProps, "onSelect"> & {
  personIds: Array<Person["id"]>;
  selected?: Array<Person["id"]>;
  onSelect?: (selected: Array<Person["id"]>) => void;
  multiselect?: boolean;
};

export function ListPersons({
  personIds,
  selected = [],
  onSelect,
  multiselect,
  ...stackProps
}: ListPersonsProps) {
  console.log(`ListPersons -> render`);

  const togglePersonSelection = useCallback(
    (personId: Person["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === personId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== personId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, personId]) : undefined;
      }

      return onSelect ? onSelect([personId]) : undefined;
    },
    [selected, multiselect, onSelect]
  );

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      overflow="hidden"
      {...stackProps}
    >
      <Box overflow="auto">
        <List>
          {personIds.map((personId, index) => (
            <ListItem
              key={`list-person-${index}`}
              sx={{
                "&:not(:last-child)": { marginBottom: 1 },
              }}
              disablePadding
            >
              <CardPerson
                personId={personId}
                onClick={onSelect ? togglePersonSelection : undefined}
                selected={onSelect ? selected.includes(personId) : undefined}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label="Selected"
          components={selected.map((selectedId) => (
            <PersonChip
              personId={selectedId}
              onClose={() => togglePersonSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
