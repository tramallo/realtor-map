import { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, CircularProgress, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";

import {
  CustomCalendarDay,
  CustomCalendarDayProps,
} from "../CustomCalendarDay";
import { useContractStore } from "../../stores/contractsStore";
import {
  dateToTimestamp,
  OperationResponse,
  timestampToDDMMYYString,
} from "../../utils/helperFunctions";
import { Contract } from "../../utils/data-schema";
import CustomModal from "../CustomModal";
import { ListContracts } from "./ListContracts";

export type CalendarContractsProps = BoxProps & {
  contractIds: Array<Contract["id"]>;
};

export function CalendarContracts({
  contractIds,
  ...boxProps
}: CalendarContractsProps) {
  const contracts = useContractStore((store) => store.contracts);
  const fetchContracts = useContractStore((store) => store.fetchContracts);

  const [fetchingContracts, setFetchingContracts] = useState(false);
  const [fetchContractsResponse, setFetchContractsResponse] = useState(
    undefined as OperationResponse | undefined
  );

  //controls modal open state
  const [viewContractsDate, setViewContractsDate] = useState(
    undefined as string | undefined
  );

  const highlightedDates: Record<
    string,
    { colors: string[]; contractIds: Array<Contract["id"]> }
  > = useMemo(() => {
    const highlightsObject = {} as Record<
      string,
      { colors: string[]; contractIds: Array<Contract["id"]> }
    >;

    contractIds.forEach((contractId) => {
      const contract = contracts[contractId];
      if (!contract) {
        return;
      }

      const contractStartAsString = timestampToDDMMYYString(contract.start)!;
      if (!highlightsObject[contractStartAsString]) {
        highlightsObject[contractStartAsString] = {
          colors: ["green"],
          contractIds: [contractId],
        };
      } else {
        highlightsObject[contractStartAsString].contractIds.push(contractId);
        if (!highlightsObject[contractStartAsString].colors.includes("green")) {
          highlightsObject[contractStartAsString].colors.push("green");
        }
      }

      const contractEndAsString = timestampToDDMMYYString(contract.end)!;
      if (!highlightsObject[contractEndAsString]) {
        highlightsObject[contractEndAsString] = {
          colors: ["orange"],
          contractIds: [contractId],
        };
      } else {
        highlightsObject[contractEndAsString].contractIds.push(contractId);
        if (!highlightsObject[contractEndAsString].colors.includes("orange")) {
          highlightsObject[contractEndAsString].colors.push("orange");
        }
      }
    });

    return highlightsObject;
  }, [contractIds, contracts]);

  // fetchContracts effect
  useEffect(() => {
    setFetchContractsResponse(undefined);
    setFetchingContracts(true);
    fetchContracts(contractIds)
      .then(setFetchContractsResponse)
      .finally(() => setFetchingContracts(false));
  }, [contractIds, fetchContracts]);

  return (
    <Box {...boxProps} boxSizing="border-box">
      <DateCalendar
        value={null}
        loading={fetchingContracts || !!fetchContractsResponse?.error}
        renderLoading={() =>
          fetchContractsResponse?.error ? (
            <Typography variant="h6" color="error" textAlign="center">
              {fetchContractsResponse?.error.message}
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
          day: (ownerState): Partial<CustomCalendarDayProps> => {
            const ownerDayAsString = timestampToDDMMYYString(
              dateToTimestamp(ownerState.day)!
            )!;

            const highlightDay = highlightedDates[ownerDayAsString];

            if (!highlightDay) {
              return {};
            }

            return {
              highlightColors: highlightDay.colors,
              onClick: () => setViewContractsDate(ownerDayAsString),
            };
          },
        }}
      />
      <CustomModal
        title={`Contracts at ${viewContractsDate}`}
        open={viewContractsDate != undefined}
        onClose={() => setViewContractsDate(undefined)}
      >
        <Box padding={1}>
          <ListContracts
            contractIds={
              highlightedDates[viewContractsDate!]?.contractIds ?? []
            }
          />
        </Box>
      </CustomModal>
    </Box>
  );
}
