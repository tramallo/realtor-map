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
  useRealtorStore,
} from "../../stores/realtorsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { Realtor } from "../../utils/data-schema";
import CreateRealtor from "./CreateRealtor";
import { FilterRealtors } from "./FilterRealtors";
import CustomModal from "../CustomModal";
import { RealtorFilter } from "../../utils/data-filter-schema";
import { ListRealtors } from "./ListRealtors";

interface SearchRealtorsProps {
  onSelect?: (realtorIds: Array<Realtor["id"]>) => void;
  defaultSelected?: Array<Realtor["id"]>;
  multiselect?: boolean;
}

export default function SearchRealtors({
  onSelect,
  defaultSelected = [],
  multiselect,
}: SearchRealtorsProps) {
  const searchRealtors = useRealtorStore((store) => store.searchRealtors);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [realtorsFilter, setRealtorsFilter] = useState({
    deleted: false,
  } as RealtorFilter);

  const [searchingRealtors, setSearchingRealtors] = useState(false);
  const [searchRealtorsResponse, setSearchRealtorsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [selectedRealtors, setSelectedRealtors] = useState(defaultSelected);
  const [createRealtorModalOpen, setCreateRealtorModalOpen] = useState(false);

  const filteredRealtorIds = useRealtorStore(
    searchResultByStringFilter(JSON.stringify(realtorsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  // searchRealtors effect
  useEffect(() => {
    setSearchRealtorsResponse(undefined);
    setSearchingRealtors(true);
    searchRealtors(realtorsFilter)
      .then(setSearchRealtorsResponse)
      .finally(() => setSearchingRealtors(false));
  }, [searchRealtors, realtorsFilter]);

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
      {searchRealtorsResponse?.error && (
        <Typography variant="h6" align="center" color="error">
          {searchRealtorsResponse.error.message}
        </Typography>
      )}
      {!searchRealtorsResponse?.error && (
        <ListRealtors
          realtorIds={filteredRealtorIds ?? []}
          selected={selectedRealtors}
          onSelect={onSelect ? setSelectedRealtors : undefined}
          multiselect={multiselect}
          flexGrow={1}
        />
      )}

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              icon={
                searchingRealtors ? <CircularProgress size="1em" /> : undefined
              }
              label={
                searchingRealtors
                  ? undefined
                  : `Filters (${countDefinedAttributes(realtorsFilter)})`
              }
              disabled={searchingRealtors}
              color="primary"
              onClick={toggleFiltersVisibility}
              size="small"
            />
          </Divider>
          <Collapse in={filtersVisible}>
            <FilterRealtors
              filter={realtorsFilter}
              onChange={setRealtorsFilter}
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
            onClick={() => setCreateRealtorModalOpen(true)}
          >
            New Realtor
          </Button>
          {onSelect && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => setSelectedRealtors([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={() => onSelect(selectedRealtors)}
              >
                Confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <CustomModal
        title="Create Realtor"
        open={createRealtorModalOpen}
        onClose={() => setCreateRealtorModalOpen(false)}
      >
        <CreateRealtor onCreate={() => setCreateRealtorModalOpen(false)} />
      </CustomModal>
    </Stack>
  );
}
