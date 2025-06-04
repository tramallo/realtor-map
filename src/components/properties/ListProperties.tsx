import { useCallback, useEffect, useRef } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Property } from "../../utils/data-schema";
import { CardProperty } from "./CardProperty";
import ComponentsField from "../ComponentsField";
import PropertyChip from "../PropertyChip";

export type ListPropertiesProps = {
  propertyIds: Array<Property["id"]> | undefined;
  onReachScrollEnd?: () => void;
  selected?: Array<Property["id"]>;
  onSelect?: (selected: Array<Property["id"]>) => void;
  multiselect?: boolean;
} & Omit<StackProps, "onSelect">;
const defaults = {
  selected: [],
};

export function ListProperties({
  propertyIds,
  onReachScrollEnd,
  selected = defaults.selected,
  onSelect,
  multiselect,
  ...stackProps
}: ListPropertiesProps) {
  const bottomRef = useRef(null as HTMLLIElement | null);

  const { t } = useTranslation();

  console.log(`ListProperties -> render - 
    propertyIds: ${propertyIds}`);

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

  // onReachScrollEnd effect
  useEffect(() => {
    const bottomItem = bottomRef.current;
    if (!bottomItem || !onReachScrollEnd) {
      return;
    }
    console.log(
      `ListProperties -> onReachScrollEnd [effect] - register callback`
    );

    const onScrollEnd = () => {
      console.log(
        `ListProperties -> onReachScrollEnd [effect] - execute callback`
      );
      onReachScrollEnd();
    };

    const observer = new IntersectionObserver(
      (entries) => (entries[0].isIntersecting ? onScrollEnd() : undefined),
      {
        root: null,
        threshold: 0.1,
      }
    );

    observer.observe(bottomItem);
    return () => {
      console.log(
        `ListProperties -> onReachScrollEnd [effect] - unregister callback`
      );
      observer.unobserve(bottomItem);
    };
  }, [onReachScrollEnd]);

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      overflow="hidden"
      {...stackProps}
    >
      <Box overflow="auto">
        <List disablePadding>
          {(propertyIds ?? []).map((propertyId, propertyIndex) => (
            <ListItem
              key={propertyIndex}
              sx={{ marginBottom: 1 }}
              disablePadding
            >
              <CardProperty
                propertyId={propertyId}
                onClick={onSelect ? togglePropertySelection : undefined}
                selected={onSelect ? selected.includes(propertyId) : undefined}
              />
            </ListItem>
          ))}
          <ListItem ref={bottomRef}></ListItem>
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label={t("fields.selectedField.label")}
          components={selected.map((selectedId, selectedIndex) => (
            <PropertyChip
              key={selectedIndex}
              propertyId={selectedId}
              onClose={() => togglePropertySelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
