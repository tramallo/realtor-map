import { useCallback } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Client } from "../../utils/data-schema";
import { CardClient } from "./CardClient";
import ComponentsField from "../ComponentsField";
import ClientChip from "../ClientChip";

export type ListClientsProps = Omit<StackProps, "onSelect"> & {
  clientIds: Array<Client["id"]>;
  selected?: Array<Client["id"]>;
  onSelect?: (selected: Array<Client["id"]>) => void;
  multiselect?: boolean;
};

export function ListPersons({
  clientIds,
  selected = [],
  onSelect,
  multiselect,
  ...stackProps
}: ListClientsProps) {
  const { t } = useTranslation();

  const toggleClientSelection = useCallback(
    (clientId: Client["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === clientId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== clientId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, clientId]) : undefined;
      }

      return onSelect ? onSelect([clientId]) : undefined;
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
          {clientIds.map((clientId, index) => (
            <ListItem
              key={`list-client-${index}`}
              sx={{
                "&:not(:last-child)": { marginBottom: 1 },
              }}
              disablePadding
            >
              <CardClient
                clientId={clientId}
                onClick={onSelect ? toggleClientSelection : undefined}
                selected={onSelect ? selected.includes(clientId) : undefined}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label={t("fields.selectedField.label")}
          components={selected.map((selectedId) => (
            <ClientChip
              clientId={selectedId}
              onClose={() => toggleClientSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
