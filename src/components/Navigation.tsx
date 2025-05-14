import { ReactNode, useState } from "react";
import { Box, Button, Stack } from "@mui/material";

export interface NavigationSlide {
  label: string;
  component: React.ReactNode;
}

export interface NavigationProps {
  slides: NavigationSlide[];
  children?: ReactNode;
}

export default function Navigation({ slides, children }: NavigationProps) {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  return (
    <Box
      boxSizing="border-box"
      width="100svw"
      height="100svh"
      display="flex"
      flexDirection={{
        xs: "column",
        sm: "column",
        md: "row-reverse",
      }}
    >
      <Box
        //content box
        boxSizing="border-box"
        width={{ xs: "100svw", md: "90svw" }}
        height={{ xs: "90svh", md: "100svh" }}
        sx={{ overflowX: "hidden", overflowY: "auto" }}
      >
        {slides[activeSlideIndex].component}
      </Box>
      <Box
        //side-bottom bar
        boxSizing="border-box"
        width={{ xs: "100svw", md: "10svw" }}
        height={{ xs: "10svh", md: "100svh" }}
        overflow="hidden"
      >
        <Stack
          direction={{ xs: "row", md: "column" }}
          boxSizing="border-box"
          width="100%"
          height="100%"
          sx={{
            borderTop: {
              xs: "2px solid black",
              md: "0",
            },
            borderRight: { md: "2px solid black" },
          }}
        >
          {slides.map((slide, index) => (
            <Button
              key={`nav-button-${slide.label}-${index}`}
              onClick={() => setActiveSlideIndex(index)}
              variant="contained"
              color={activeSlideIndex == index ? "secondary" : "primary"}
              sx={{ flex: 1, borderRadius: 0 }}
            >
              {slide.label}
            </Button>
          ))}
          {children}
        </Stack>
      </Box>
    </Box>
  );
}
