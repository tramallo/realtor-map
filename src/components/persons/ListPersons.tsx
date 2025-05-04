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

import { usePersonStore } from "../../stores/personsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { personCompliesFilter } from "../../utils/filter-evaluators";
import { Person } from "../../utils/data-schema";
import ViewPerson from "./ViewPerson";
import CreatePerson from "./CreatePerson";
import { FilterPersons } from "./FilterPersons";
import CustomModal from "../CustomModal";
import ComponentsField from "../ComponentsField";
import PersonChip from "../PersonChip";
import { PersonFilter } from "../../utils/data-filter-schema";

interface ListPersonsProps {
  onSelect?: (personIds: Array<Person["id"]>) => void;
  defaultSelected?: Array<Person["id"]>;
  multiple?: boolean;
}

export default function ListPersons({
  onSelect,
  defaultSelected,
  multiple,
}: ListPersonsProps) {
  const searchPersons = usePersonStore((store) => store.searchPersons);

  const [selectedPersons, setSelectedPersons] = useState(defaultSelected ?? []);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [personsFilter, setPersonsFilter] = useState({
    deleted: false,
  } as PersonFilter);

  const [searchingPersons, setSearchingPersons] = useState(false);
  const [searchPersonsResponse, setSearchPersonsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewPersonId, setViewPersonId] = useState(
    undefined as Person["id"] | undefined
  );
  const [createPersonModalOpen, setCreatePersonModalOpen] = useState(false);

  const cachedPersons = usePersonStore((store) => store.persons);
  const filteredPersons = useMemo(
    () =>
      Object.values(cachedPersons).filter((person) =>
        personCompliesFilter(person, personsFilter)
      ),
    [cachedPersons, personsFilter]
  );

  const togglePersonSelection = useCallback(
    (personId: Person["id"]) => {
      const alreadySelected = selectedPersons.some(
        (selectedId) => selectedId === personId
      );

      //deselect
      if (alreadySelected) {
        setSelectedPersons((prevSelected) =>
          prevSelected.filter((id) => id !== personId)
        );
        return;
      }

      //select
      if (multiple) {
        setSelectedPersons((prevSelected) => [...prevSelected, personId]);
      } else {
        setSelectedPersons([personId]);
      }
    },
    [selectedPersons, multiple]
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
      <Box
        overflow="auto"
        borderRadius={1}
        border="1px solid black"
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      >
        {searchPersonsResponse?.error && (
          <Typography variant="h6" align="center" color="error">
            {searchPersonsResponse.error.message}
          </Typography>
        )}
        {!searchPersonsResponse?.error && (
          <>
            {!searchingPersons && filteredPersons.length === 0 ? (
              <Typography variant="h6" align="center" color="warning">
                No person(s) found
              </Typography>
            ) : (
              <List dense>
                {filteredPersons.map((person, index) => (
                  <ListItem
                    key={`list-person-${index}`}
                    disablePadding
                    secondaryAction={
                      <IconButton onClick={() => setViewPersonId(person.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={
                        onSelect
                          ? () => togglePersonSelection(person.id)
                          : undefined
                      }
                    >
                      {onSelect && (
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedPersons.includes(person.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                      )}
                      <ListItemText primary={person.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {searchingPersons && (
              <Typography padding={1} align="center">
                <CircularProgress />
              </Typography>
            )}
          </>
        )}
      </Box>

      <Stack spacing={1}>
        <Stack spacing={filtersVisible ? 1 : 0}>
          <Divider>
            <Chip
              label={`Filters (${countDefinedAttributes(personsFilter)})`}
              color="primary"
              onClick={toggleFiltersVisibility}
              size="small"
            />
          </Divider>
          <Collapse in={filtersVisible}>
            <FilterPersons filter={personsFilter} onChange={setPersonsFilter} />
          </Collapse>
        </Stack>
        {onSelect && (
          <ComponentsField
            label="Selected"
            components={selectedPersons.map((selectedId) => (
              <PersonChip
                personId={selectedId}
                onClose={() => togglePersonSelection(selectedId)}
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
      <CustomModal
        title={`View person: ${viewPersonId}`}
        open={viewPersonId != undefined}
        onClose={() => setViewPersonId(undefined)}
      >
        <ViewPerson personId={viewPersonId ?? 0} />
      </CustomModal>
    </Stack>
  );
}
