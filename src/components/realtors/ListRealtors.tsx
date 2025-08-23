import { useCallback } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Realtor } from "../../utils/data-schema";
import { CardRealtor } from "./CardRealtor";
import ComponentsField from "../ComponentsField";
import RealtorChip from "../RealtorChip";

export type ListRealtorsProps = Omit<StackProps, "onSelect"> & {
  realtorIds: Array<Realtor["id"]>;
  selected?: Array<Realtor["id"]>;
  onSelect?: (selected: Array<Realtor["id"]>) => void;
  multiselect?: boolean;
};

export function ListRealtors({
  realtorIds,
  selected = [],
  onSelect,
  multiselect,
  ...stackProps
}: ListRealtorsProps) {
  const { t } = useTranslation();

  const toggleRealtorSelection = useCallback(
    (realtorId: Realtor["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === realtorId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== realtorId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, realtorId]) : undefined;
      }

      return onSelect ? onSelect([realtorId]) : undefined;
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
          {realtorIds.map((realtorId, index) => (
            <ListItem
              key={`list-realtor-${index}`}
              sx={{
                "&:not(:last-child)": { marginBottom: 1 },
              }}
              disablePadding
            >
              <CardRealtor
                realtorId={realtorId}
                onClick={onSelect ? toggleRealtorSelection : undefined}
                selected={onSelect ? selected.includes(realtorId) : undefined}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label={t("fields.selectedField.label")}
          components={selected.map((selectedId) => (
            <RealtorChip
              key={selectedId}
              realtorId={selectedId}
              onClose={() => toggleRealtorSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
