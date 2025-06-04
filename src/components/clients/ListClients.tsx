import { useCallback, useEffect, useRef } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Client } from "../../utils/data-schema";
import { CardClient } from "./CardClient";
import ComponentsField from "../ComponentsField";
import ClientChip from "../ClientChip";

export type ListClientsProps = {
  clientIds: Array<Client["id"]> | undefined;
  onReachScrollEnd?: () => void;
  selected?: Array<Client["id"]>;
  onSelect?: (selected: Array<Client["id"]>) => void;
  multiselect?: boolean;
} & Omit<StackProps, "onSelect">;
const defaults = {
  selected: [],
};

export function ListPersons({
  clientIds,
  onReachScrollEnd,
  selected = defaults.selected,
  onSelect,
  multiselect,
  ...stackProps
}: ListClientsProps) {
  const bottomRef = useRef(null as HTMLLIElement | null);

  const { t } = useTranslation();

  console.log(`ListClients -> render - 
    clientIds: ${clientIds}`);

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

  // onReachScrollEnd effect
  useEffect(() => {
    const bottomItem = bottomRef.current;
    if (!bottomItem || !onReachScrollEnd) {
      return;
    }
    console.log(`ListClients -> onReachScrollEnd [effect] - register callback`);

    const onScrollEnd = () => {
      console.log(
        `ListClients -> onReachScrollEnd [effect] - execute callback`
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
        `ListClients -> onReachScrollEnd [effect] - unregister callback`
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
          {(clientIds ?? []).map((clientId, clientIndex) => (
            <ListItem key={clientIndex} sx={{ marginBottom: 1 }} disablePadding>
              <CardClient
                clientId={clientId}
                onClick={onSelect ? toggleClientSelection : undefined}
                selected={onSelect ? selected.includes(clientId) : undefined}
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
            <ClientChip
              key={selectedIndex}
              clientId={selectedId}
              onClose={() => toggleClientSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
