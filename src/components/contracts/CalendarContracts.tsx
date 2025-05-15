import { useEffect, useMemo, useState } from "react";
import { Box, BoxProps, CircularProgress, Typography } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import { isSameDay } from "date-fns";

import {
  CustomCalendarDay,
  CustomCalendarDayProps,
} from "../CustomCalendarDay";
import { useContractStore } from "../../stores/contractsStore";
import {
  OperationResponse,
  timestampToDate,
} from "../../utils/helperFunctions";
import { Contract } from "../../utils/data-schema";

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

  const highlightedDates = useMemo((): Array<{
    date: Date;
    colors: string[];
  }> => {
    const highlightsObject: Record<number, string[]> = {};

    contractIds.forEach((contractId) => {
      const contract = contracts[contractId];
      if (!contract) {
        return;
      }

      if (!highlightsObject[contract.start]) {
        highlightsObject[contract.start] = ["green"];
      } else {
        if (highlightsObject[contract.start].includes("green")) {
          return;
        }
        highlightsObject[contract.start].push("green");
      }

      if (!highlightsObject[contract.end]) {
        highlightsObject[contract.end] = ["orange"];
      } else {
        if (highlightsObject[contract.end].includes("orange")) {
          return;
        }
        highlightsObject[contract.end].push("orange");
      }
    });

    const objectEntries = Object.entries(highlightsObject) as unknown as Array<
      [number, string[]]
    >;

    return objectEntries.map(([timestamp, colors]) => ({
      date: timestampToDate(timestamp)!,
      colors: colors,
    }));
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
          day: (ownerState) =>
            ({
              highlightColors: highlightedDates.find((highlight) =>
                isSameDay(highlight.date, ownerState.day)
              )?.colors,
            } as CustomCalendarDayProps),
        }}
      />
    </Box>
  );
}
