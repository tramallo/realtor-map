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
  usePersonStore,
} from "../../stores/personsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { Person } from "../../utils/data-schema";
import CreatePerson from "./CreatePerson";
import { FilterPersons } from "./FilterPersons";
import CustomModal from "../CustomModal";
import { PersonFilter } from "../../utils/data-filter-schema";
import { ListPersons } from "./ListPersons";

interface SearchPersonsProps {
  onSelect?: (personIds: Array<Person["id"]>) => void;
  defaultSelected?: Array<Person["id"]>;
  multiselect?: boolean;
}

export default function SearchPersons({
  onSelect,
  defaultSelected = [],
  multiselect,
}: SearchPersonsProps) {
  const searchPersons = usePersonStore((store) => store.searchPersons);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [personsFilter, setPersonsFilter] = useState({
    deleted: false,
  } as PersonFilter);

  const [searchingPersons, setSearchingPersons] = useState(false);
  const [searchPersonsResponse, setSearchPersonsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [selectedPersons, setSelectedPersons] = useState(defaultSelected);
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false);

  const filteredPersonIds = usePersonStore(
    searchResultByStringFilter(JSON.stringify(personsFilter))
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  //searchPersons effect
  useEffect(() => {
    console.log(`ListPersons -> effect [searchPersons]`);

    setSearchPersonsResponse(undefined);
    setSearchingPersons(true);
    searchPersons(personsFilter)
      .then(setSearchPersonsResponse)
      .finally(() => setSearchingPersons(false));
  }, [searchPersons, personsFilter]);

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
      {searchPersonsResponse?.error && (
        <Typography variant="h6" align="center" color="error">
          {searchPersonsResponse.error.message}
        </Typography>
      )}
      {!searchPersonsResponse?.error && (
        <ListPersons
          personIds={filteredPersonIds ?? []}
          selected={selectedPersons}
          onSelect={onSelect ? setSelectedPersons : undefined}
          multiselect={multiselect}
          flexGrow={1}
        />
      )}

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              icon={
                searchingPersons ? <CircularProgress size="1em" /> : undefined
              }
              label={
                searchingPersons
                  ? undefined
                  : `Filters (${countDefinedAttributes(personsFilter)})`
              }
              disabled={searchingPersons}
              color="primary"
              onClick={toggleFiltersVisibility}
              size="small"
            />
          </Divider>
          <Collapse in={filtersVisible}>
            <FilterPersons filter={personsFilter} onChange={setPersonsFilter} />
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
            onClick={() => setCreatePersonModalOpen(true)}
          >
            New person
          </Button>
          {onSelect && (
            <>
              <Button
                variant="contained"
                color="warning"
                onClick={() => setSelectedPersons([])}
              >
                Clear
              </Button>
              <Button
                variant="contained"
                onClick={() => onSelect(selectedPersons)}
              >
                Confirm
              </Button>
            </>
          )}
        </Stack>
      </Stack>

      <CustomModal
        title="Create person"
        open={createPersonModalOpen}
        onClose={() => setCreatePersonModalOpen(false)}
      >
        <CreatePerson onCreate={() => setCreatePersonModalOpen(false)} />
      </CustomModal>
    </Stack>
  );
}
