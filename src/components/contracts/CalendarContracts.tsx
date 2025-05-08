import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import { isSameDay } from "date-fns";

import {
  CustomCalendarDay,
  CustomCalendarDayProps,
} from "../CustomCalendarDay";
import { useContractStore } from "../../stores/contractsStore";
import { ContractFilter } from "../../utils/data-filter-schema";
import {
  countDefinedAttributes,
  OperationResponse,
  timestampToDate,
} from "../../utils/helperFunctions";
import { contractCompliesFilter } from "../../utils/filter-evaluators";
import { FilterContracts } from "./FilterContracts";
import CustomModal from "../CustomModal";
import CreateContract from "./CreateContract";

export function CalendarContracts() {
  const searchContracts = useContractStore((store) => store.searchContracts);

  const [createContractModalOpen, setCreateContractModalOpen] = useState(false);

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [contractsFilter, setContractsFilter] = useState({
    deleted: false,
  } as ContractFilter);

  const [searchingContracts, setSearchingContracts] = useState(false);
  const [searchContractsResponse, setSearchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  const cachedContracts = useContractStore((store) => store.contracts);
  const filteredContracts = useMemo(
    () =>
      Object.values(cachedContracts).filter((contract) =>
        contractCompliesFilter(contract, contractsFilter)
      ),
    [cachedContracts, contractsFilter]
  );

  const highlightedDates = useMemo((): Array<{
    date: Date;
    colors: string[];
  }> => {
    const highlightObject: Record<number, string[]> = {};

    filteredContracts.forEach((contract) => {
      if (!highlightObject[contract.start]) {
        highlightObject[contract.start] = ["green"];
      } else {
        if (highlightObject[contract.start].includes("green")) {
          return;
        }
        highlightObject[contract.start].push("green");
      }

      if (!highlightObject[contract.end]) {
        highlightObject[contract.end] = ["orange"];
      } else {
        if (highlightObject[contract.end].includes("orange")) {
          return;
        }
        highlightObject[contract.end].push("orange");
      }
    });

    const objectEntries = Object.entries(highlightObject) as unknown as Array<
      [number, string[]]
    >;

    return objectEntries.map(([timestamp, colors]) => ({
      date: timestampToDate(timestamp)!,
      colors: colors,
    }));
  }, [filteredContracts]);

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
      boxSizing="border-box"
      padding={1}
      height="100%"
      justifyContent="space-between"
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
    >
      <DateCalendar
        value={null}
        loading={searchingContracts || !!searchContractsResponse?.error}
        renderLoading={() =>
          searchContractsResponse?.error ? (
            <Typography variant="h6" color="error" textAlign="center">
              {searchContractsResponse?.error.message}
            </Typography>
          ) : (
            <CircularProgress />
          )
        }
        sx={(theme) => ({
          backgroundColor: theme.palette.grey[200],
          borderRadius: 3,
          margin: 0,
          width: "100%",
        })}
        views={["year", "month", "day"]}
        disableHighlightToday
        showDaysOutsideCurrentMonth
        slots={{ day: CustomCalendarDay }}
        slotProps={{
          day: (ownerState) =>
            ({
              highlightColors: highlightedDates.find((highlight) =>
                isSameDay(highlight.date, ownerState.day)
              )?.colors,
            } as CustomCalendarDayProps),
        }}
      />

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
        </Stack>
      </Stack>
      <CustomModal
        title="Create Contract"
        open={createContractModalOpen}
        onClose={() => setCreateContractModalOpen(false)}
      >
        <CreateContract onCreate={() => setCreateContractModalOpen(false)} />
      </CustomModal>
    </Stack>
  );
}
