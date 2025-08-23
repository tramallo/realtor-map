import React, { ReactElement, useState } from "react";
import { Box, Button, Divider, Stack, useMediaQuery } from "@mui/material";

export interface NavigationAction {
  label: string;
  icon?: ReactElement;
  callback: () => void;
}

export interface NavigationSlide {
  label: string;
  component: React.ReactNode;
}

export interface NavigationProps {
  slides: NavigationSlide[];
  actions?: Array<NavigationAction>;
}

export default function Navigation({ slides, actions }: NavigationProps) {
  const sizeMdOrGreater = useMediaQuery((theme) => theme.breakpoints.up("md"));

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
      sx={(theme) => ({ backgroundColor: theme.palette.grey[500] })}
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
          padding={1}
          spacing={1}
          boxSizing="border-box"
          width="100%"
          height="100%"
          justifyContent="center"
        >
          {slides.map((slide, index) => (
            <Button
              key={`nav-button-${index}`}
              variant="contained"
              onClick={() => setActiveSlideIndex(index)}
              color={activeSlideIndex == index ? "secondary" : undefined}
              sx={{ flex: 1 }}
            >
              {slide.label}
            </Button>
          ))}
          {actions && (
            <>
              <Divider
                flexItem
                orientation={sizeMdOrGreater ? "horizontal" : "vertical"}
                sx={{ mx: 0.5, my: 1 }}
              />
              {actions.map(({ label, icon, callback }, index) => (
                <Button
                  key={`action-button-${index}`}
                  variant="contained"
                  onClick={callback}
                  color="info"
                  sx={{ flex: 1 }}
                >
                  {icon ?? label}
                </Button>
              ))}
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
}
