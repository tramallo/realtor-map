import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Realtor } from "../../utils/data-schema";
import { useRealtorStore } from "../../stores/realtorsStore";
import {
  countDefinedAttributes,
  OperationResponse,
} from "../../utils/helperFunctions";
import { realtorCompliesFilter } from "../../utils/filter-evaluators";
import ComponentsField from "../ComponentsField";
import { FilterRealtors } from "./FilterRealtors";
import CustomModal from "../CustomModal";
import CreateRealtor from "./CreateRealtor";
import ViewRealtor from "./ViewRealtor";
import RealtorChip from "../RealtorChip";
import { RealtorFilter } from "../../utils/data-filter-schema";

interface ListRealtorsProps {
  onSelect?: (realtorIds: Array<Realtor["id"]>) => void;
  defaultSelected?: Array<Realtor["id"]>;
  multiple?: boolean;
}

export default function ListRealtors({
  onSelect,
  defaultSelected,
  multiple,
}: ListRealtorsProps) {
  const searchRealtors = useRealtorStore((store) => store.searchRealtors);

  const [selectedRealtors, setSelectedRealtors] = useState(
    defaultSelected ?? []
  );

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [realtorsFilter, setRealtorsFilter] = useState({
    deleted: false,
  } as RealtorFilter);

  const [searchingRealtors, setSearchingRealtors] = useState(false);
  const [searchRealtorsResponse, setSearchRealtorsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const [viewRealtorId, setViewRealtorId] = useState(
    undefined as Realtor["id"] | undefined
  );
  const [createRealtorModalOpen, setCreateRealtorModalOpen] = useState(false);

  const cachedRealtors = useRealtorStore((store) => store.realtors);
  const filteredRealtors = useMemo(
    () =>
      Object.values(cachedRealtors).filter((realtor) =>
        realtorCompliesFilter(realtor, realtorsFilter)
      ),
    [cachedRealtors, realtorsFilter]
  );

  const toggleRealtorSelection = useCallback(
    (realtorId: Realtor["id"]) => {
      const alreadySelected = selectedRealtors.some(
        (selectedId) => selectedId === realtorId
      );

      //deselect
      if (alreadySelected) {
        setSelectedRealtors((prevSelected) =>
          prevSelected.filter((id) => id !== realtorId)
        );
        return;
      }

      //select
      if (multiple) {
        setSelectedRealtors((prevSelected) => [...prevSelected, realtorId]);
      } else {
        setSelectedRealtors([realtorId]);
      }
    },
    [selectedRealtors, multiple]
  );

  const toggleFiltersVisibility = useCallback(
    () => setFiltersVisible(!filtersVisible),
    [filtersVisible]
  );

  //searchRealtors effect
  useEffect(() => {
    console.log(`ListRealtors -> effect [searchRealtors]`);

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
      <Box
        overflow="auto"
        border="2px solid black"
        borderRadius={1}
        sx={(theme) => ({ backgroundColor: theme.palette.grey[200] })}
      >
        {searchRealtorsResponse?.error && (
          <Typography variant="h6" align="center" color="error">
            {searchRealtorsResponse.error.message}
          </Typography>
        )}
        {!searchRealtorsResponse?.error && (
          <>
            {!searchingRealtors && filteredRealtors.length === 0 ? (
              <Typography variant="h6" align="center" color="warning">
                No realtor(s) found
              </Typography>
            ) : (
              <List dense>
                {filteredRealtors.map((realtor, index) => (
                  <ListItem
                    key={`list-realtor-${index}`}
                    disablePadding
                    secondaryAction={
                      <IconButton onClick={() => setViewRealtorId(realtor.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={
                        onSelect
                          ? () => toggleRealtorSelection(realtor.id)
                          : undefined
                      }
                    >
                      {onSelect && (
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={selectedRealtors.includes(realtor.id)}
                            tabIndex={-1}
                            disableRipple
                          />
                        </ListItemIcon>
                      )}
                      <ListItemText primary={realtor.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
            {searchingRealtors && (
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
              label={`Filters (${countDefinedAttributes(realtorsFilter)})`}
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
        {onSelect && (
          <ComponentsField
            label="Selected"
            components={selectedRealtors.map((selectedId) => (
              <RealtorChip
                realtorId={selectedId}
                onClose={() => toggleRealtorSelection(selectedId)}
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
            onClick={() => setCreateRealtorModalOpen(true)}
          >
            New realtor
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
        title="Create realtor"
        open={createRealtorModalOpen}
        onClose={() => setCreateRealtorModalOpen(false)}
      >
        <CreateRealtor onCreate={() => setCreateRealtorModalOpen(false)} />
      </CustomModal>
      <CustomModal
        title={`View realtor: ${viewRealtorId}`}
        open={viewRealtorId != undefined}
        onClose={() => setViewRealtorId(undefined)}
      >
        <ViewRealtor realtorId={viewRealtorId ?? 0} />
      </CustomModal>
    </Stack>
  );
}
