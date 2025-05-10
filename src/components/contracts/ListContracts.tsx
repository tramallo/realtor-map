import { useCallback } from "react";
import { Box, List, ListItem, Stack, StackProps } from "@mui/material";

import { Contract } from "../../utils/data-schema";
import { CardContract } from "./CardContract";
import ComponentsField from "../ComponentsField";
import ContractChip from "../ContractChip";

export type ListContractsProps = Omit<StackProps, "onSelect"> & {
  contractIds: Array<Contract["id"]>;
  selected?: Array<Contract["id"]>;
  onSelect?: (selected: Array<Contract["id"]>) => void;
  multiselect?: boolean;
};

export function ListContracts({
  contractIds,
  selected = [],
  onSelect,
  multiselect,
  ...stackProps
}: ListContractsProps) {
  console.log(`ListContracts -> render`);

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

  return (
    <Stack
      spacing={1}
      justifyContent="space-between"
      overflow="hidden"
      {...stackProps}
    >
      <Box overflow="auto">
        <List>
          {contractIds.map((contractId, index) => (
            <ListItem
              key={`list-contract-${index}`}
              sx={{
                "&:not(:last-child)": { marginBottom: 1 },
              }}
              disablePadding
            >
              <CardContract
                contractId={contractId}
                onClick={onSelect ? toggleContractSelection : undefined}
                selected={onSelect ? selected.includes(contractId) : undefined}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      {onSelect && (
        <ComponentsField
          label="Selected"
          components={selected.map((selectedId) => (
            <ContractChip
              contractId={selectedId}
              onClose={() => toggleContractSelection(selectedId)}
            />
          ))}
        />
      )}
    </Stack>
  );
}
