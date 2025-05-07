import { Box } from "@mui/material";
import { DateCalendar } from "@mui/x-date-pickers";
import { addDays, isSameDay } from "date-fns";

import {
  CustomCalendarDay,
  CustomCalendarDayProps,
} from "../CustomCalendarDay";

export function CalendarContracts() {
  const highlightedDays = [
    new Date(),
    addDays(new Date(), 2),
    addDays(new Date(), 4),
  ];

  return (
    <Box padding={1}>
      <DateCalendar
        showDaysOutsideCurrentMonth
        sx={{ border: "2px solid red" }}
        slots={{ day: CustomCalendarDay }}
        slotProps={{
          day: (ownerState) =>
            ({
              highlightColors: highlightedDays.some((highlightedDay) =>
                isSameDay(highlightedDay, ownerState.day)
              )
                ? ["green", "orange"]
                : undefined,
            } as CustomCalendarDayProps),
        }}
      />
    </Box>
  );
}
