import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Contract } from "../../utils/data-schema";
import { useContractStore } from "../../stores/contractsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { contractCompliesFilter } from "../../utils/filter-evaluators";
import ComponentsField from "../ComponentsField";
import { FilterContracts } from "./FilterContracts";
import CustomModal from "../CustomModal";
//import CreateContract from "./CreateContract";
import ViewContract from "./ViewContract";
import ContractChip from "../ContractChip";
import { ContractFilter } from "../../utils/data-filter-schema";
import CreateContract from "./CreateContract";

interface ListContractsProps {
  onSelect?: (contractIds: Array<Contract["id"]>) => void;
  defaultSelected?: Array<Contract["id"]>;
  multiple?: boolean;
}

export default function ListContracts({
  onSelect,
  defaultSelected,
  multiple,
}: ListContractsProps) {
  const searchContracts = useContractStore((store) => store.searchContracts);

  const [selectedContracts, setSelectedContracts] = useState(
    defaultSelected ?? []
  );
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contractsFilter, setContractsFilter] = useState({
    deleted: false,
  } as ContractFilter);

  const [searchingContracts, setSearchingContracts] = useState(false);
  const [searchContractsResponse, setSearchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewContractId, setViewContractId] = useState(
    undefined as Contract["id"] | undefined
  );
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

  const cachedContracts = useContractStore((store) => store.contracts);
  const filteredContracts = useMemo(
    () =>
      Object.values(cachedContracts).filter((contract) =>
        contractCompliesFilter(contract, contractsFilter)
      ),
    [cachedContracts, contractsFilter]
  );

  const toggleContractSelection = useCallback(
    (contractId: Contract["id"]) => {
      const alreadySelected = selectedContracts.some(
        (selectedId) => selectedId === contractId
      );

      if (alreadySelected) {
        setSelectedContracts((prev) => prev.filter((id) => id !== contractId));
        return;
      }

      if (multiple) {
        setSelectedContracts((prev) => [...prev, contractId]);
      } else {
        setSelectedContracts([contractId]);
      }
    },
    [selectedContracts, multiple]
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  useEffect(() => {
    setSearchContractsResponse(undefined);
    setSearchingContracts(true);
    searchContracts(contractsFilter)
      .then(setSearchContractsResponse)
      .finally(() => setSearchingContracts(false));
  }, [searchContracts, contractsFilter]);

  return (
    <Stack
      spacing={1}
      padding={1}
      height="100%"
      boxSizing="border-box"
      overflow="hidden"
      justifyContent="space-between"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <Box
        overflow="auto"
        borderRadius={1}
        border="1px solid black"
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      >
        {searchContractsResponse?.error && (
          <Typography variant="h6" align="center" color="error">
            {searchContractsResponse.error.message}
          </Typography>
        )}
        {!searchContractsResponse?.error && (
          <>
            {!searchingContracts && filteredContracts.length === 0 ? (
              <Typography variant="h6" align="center" color="warning">
                No contract(s) found
              </Typography>
            ) : (
              <List dense>
                {filteredContracts.map((contract, index) => (
                  <ListItem
                    key={`list-contract-${index}`}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        onClick={() => setViewContractId(contract.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={
                        onSelect
                          ? () => toggleContractSelection(contract.id)
                          : undefined
                      }
                    >
                      {onSelect && (
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedContracts.includes(contract.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                      )}
                      <ListItemText
                        primary={`${contract.property} :: ${contract.client}`}
                        secondary={`${contract.start} -> ${contract.end}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </>
        )}
      </Box>

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              icon={
                searchingContracts ? <CircularProgress size="1em" /> : undefined
              }
              label={
                searchingContracts
                  ? undefined
                  : `Filters (${countDefinedAttributes(contractsFilter)})`
              }
              disabled={searchingContracts}
              color="primary"
              onClick={toggleFiltersVisibility}
              size="small"
            />
          </Divider>
          <Collapse in={filtersVisible}>
            <FilterContracts
              filter={contractsFilter}
              onChange={setContractsFilter}
            />
          </Collapse>
        </Stack>
        {onSelect && (
          <ComponentsField
            label="Selected"
            components={selectedContracts.map((selectedId) => (
              <ContractChip
                contractId={selectedId}
                onClose={() => toggleContractSelection(selectedId)}
              />
            ))}
          />
        )}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="end"
          spacing={1}
        >
          <Button
            variant="contained"
            color="success"
            onClick={() => setCreateContractModalOpen(true)}
          >
            New Contract
          </Button>
          {onSelect && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => setSelectedContracts([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={() => onSelect(selectedContracts)}
              >
                Confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <CustomModal
        title="Create Contract"
        open={createContractModalOpen}
        onClose={() => setCreateContractModalOpen(false)}
      >
        <CreateContract onCreate={() => setCreateContractModalOpen(false)} />
      </CustomModal>
      <CustomModal
        title={`View Contract: ${viewContractId}`}
        open={viewContractId != undefined}
        onClose={() => setViewContractId(undefined)}
      >
        <ViewContract contractId={viewContractId ?? 0} />
      </CustomModal>
    </Stack>
  );
}
