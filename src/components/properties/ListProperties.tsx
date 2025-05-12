import { useCallback } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";

import { Property } from "../../utils/data-schema";
import { CardProperty } from "./CardProperty";
import ComponentsField from "../ComponentsField";
import PropertyChip from "../PropertyChip";

export type ListPropertiesProps = Omit<StackProps, "onSelect"> & {
  propertyIds: Array<Property["id"]>;
  selected?: Array<Property["id"]>;
  onSelect?: (selected: Array<Property["id"]>) => void;
  multiselect?: boolean;
};

export function ListProperties({
  propertyIds,
  selected = [],
  onSelect,
  multiselect,
  ...stackProps
}: ListPropertiesProps) {
  console.log(`ListProperties -> render`);

  const togglePropertySelection = useCallback(
    (propertyId: Property["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === propertyId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== propertyId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, propertyId]) : undefined;
      }

      return onSelect ? onSelect([propertyId]) : undefined;
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
          {propertyIds.map((propertyId, index) => (
            <ListItem
              key={`list-property-${index}`}
              sx={{
                "&:not(:last-child)": { marginBottom: 1 },
              }}
              disablePadding
            >
              <CardProperty
                propertyId={propertyId}
                onClick={onSelect ? togglePropertySelection : undefined}
                selected={onSelect ? selected.includes(propertyId) : undefined}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label="Selected"
          components={selected.map((selectedId) => (
            <PropertyChip
              propertyId={selectedId}
              onClose={() => togglePropertySelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
