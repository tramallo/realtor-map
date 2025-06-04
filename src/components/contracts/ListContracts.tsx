import { useCallback, useEffect, useRef } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";
import { useTranslation } from "react-i18next";

import { Contract } from "../../utils/data-schema";
import { CardContract } from "./CardContract";
import ComponentsField from "../ComponentsField";
import ContractChip from "../ContractChip";

export type ListContractsProps = {
  contractIds: Array<Contract["id"]> | undefined;
  onReachScrollEnd?: () => void;
  selected?: Array<Contract["id"]>;
  onSelect?: (selected: Array<Contract["id"]>) => void;
  multiselect?: boolean;
} & Omit<StackProps, "onSelect">;
const defaults = {
  selected: [],
};

export function ListContracts({
  contractIds,
  onReachScrollEnd,
  selected = defaults.selected,
  onSelect,
  multiselect,
  ...stackProps
}: ListContractsProps) {
  const bottomRef = useRef(null as HTMLLIElement | null);

  const { t } = useTranslation();

  console.log(`ListContracts -> render - 
    contractIds: ${contractIds}`);

  const toggleContractSelection = useCallback(
    (contractId: Contract["id"]) => {
      const alreadySelected = selected.some(
        (selectedId) => selectedId === contractId
      );

      if (alreadySelected) {
        return onSelect
          ? onSelect(selected.filter((sId) => sId !== contractId))
          : undefined;
      }

      if (multiselect) {
        return onSelect ? onSelect([...selected, contractId]) : undefined;
      }

      return onSelect ? onSelect([contractId]) : undefined;
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
      `ListContracts -> onReachScrollEnd [effect] - register callback`
    );

    const onScrollEnd = () => {
      console.log(
        `ListContracts -> onReachScrollEnd [effect] - execute callback`
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
        `ListContracts -> onReachScrollEnd [effect] - unregister callback`
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
          {(contractIds ?? []).map((contractId, contractIndex) => (
            <ListItem
              key={contractIndex}
              sx={{ marginBottom: 1 }}
              disablePadding
            >
              <CardContract
                contractId={contractId}
                onClick={onSelect ? toggleContractSelection : undefined}
                selected={onSelect ? selected.includes(contractId) : undefined}
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
            <ContractChip
              key={selectedIndex}
              contractId={selectedId}
              onClose={() => toggleContractSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
