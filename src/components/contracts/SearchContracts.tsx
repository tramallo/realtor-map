import { useState, useCallback, useEffect } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  searchResultByStringFilter,
  useContractStore,
} from "../../stores/contractsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { FilterContracts } from "./FilterContracts";
import { ContractFilter } from "../../utils/data-filter-schema";
import { ListContracts } from "./ListContracts";
import CustomModal from "../CustomModal";
import CreateContract from "./CreateContract";
import { Contract } from "../../utils/data-schema";

export interface SearchContractsProps {
  onSelect?: (selected: Array<Contract["id"]>) => void;
  defaultSelected?: Array<Contract["id"]>;
  multiselect?: boolean;
}

export default function SearchContracts({
  onSelect,
  defaultSelected = [],
  multiselect,
}: SearchContractsProps) {
  const searchContracts = useContractStore((store) => store.searchContracts);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contractsFilter, setContractsFilter] = useState({
    deleted: false,
  } as ContractFilter);

  const [searchingContracts, setSearchingContracts] = useState(false);
  const [searchContractsResponse, setSearchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [selectedContracts, setSelectedContracts] = useState(defaultSelected);
  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

  const filteredContractIds = useContractStore(
    searchResultByStringFilter(JSON.stringify(contractsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchContracts effect
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
      {searchContractsResponse?.error && (
        <Typography variant="h6" align="center" color="error">
          {searchContractsResponse.error.message}
        </Typography>
      )}
      {!searchContractsResponse?.error && (
        <ListContracts
          contractIds={filteredContractIds ?? []}
          selected={selectedContracts}
          onSelect={onSelect ? setSelectedContracts : undefined}
          multiselect={multiselect}
          flexGrow={1}
        />
      )}

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
        title="Create contract"
        open={createContractModalOpen}
        onClose={() => setCreateContractModalOpen(false)}
      >
        <CreateContract onCreate={() => setCreateContractModalOpen(false)} />
      </CustomModal>
    </Stack>
  );
}
