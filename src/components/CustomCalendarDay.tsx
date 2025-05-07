import { PickersDay, PickersDayProps } from "@mui/x-date-pickers"
import { useMemo } from "react";

export type CustomCalendarDayProps = PickersDayProps<Date> & {
  highlightColors?: string[];
};

export function CustomCalendarDay({ highlightColors, ...props }: CustomCalendarDayProps) {
  const highlightGradient = useMemo(() => {
    if (!highlightColors) {
      return undefined;
    }

    const colorDegrees = 360 / highlightColors.length;

    const gradient = `conic-gradient(${
      highlightColors.map(
        (color, index) => `${color} ${colorDegrees * index}deg ${colorDegrees * (index+1)}deg`).join(",")
    })`

    return gradient;
  }, [highlightColors])

  return (
    <PickersDay 
      {...props} 
      sx={{ 
        ...props.sx, 
        background: highlightColors ? highlightGradient : undefined,
      }} 
    />
  )
}
