import { render, screen, fireEvent } from "@testing-library/react";
import { Box, Button, Stack } from "@mui/material";
import { vi, describe, it, expect, beforeEach } from "vitest";

import Navigation from "./Navigation";

// mock dependencies
vi.mock("@mui/material", async () => ({
  Box: vi.fn((props) => <div data-testid="mui-box" {...props} />),
  Stack: vi.fn((props) => <div data-testid="mui-stack" {...props} />),
  Button: vi.fn((props) => (
    <button data-testid="mui-button" {...props}>
      {props.children}
    </button>
  )),
}));

describe("Navigation", () => {
  const slidesMock = [
    { label: "Slide 1", component: <div data-testid="slide-1" /> },
    { label: "Slide 2", component: <div data-testid="slide-2" /> },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all navigation buttons with correct labels", () => {
    render(<Navigation slides={slidesMock} />);

    expect(screen.getByText("Slide 1")).toBeInTheDocument();
    expect(screen.getByText("Slide 2")).toBeInTheDocument();
  });

  it("switches active slide on button click", () => {
    render(<Navigation slides={slidesMock} />);

    fireEvent.click(screen.getByText("Slide 2"));
    expect(screen.getByTestId("slide-2")).toBeInTheDocument();
  });

  it("initial active slide is first slide", () => {
    render(<Navigation slides={slidesMock} />);
    expect(screen.getByTestId("slide-1")).toBeInTheDocument();
  });

  it("mobile layout structure (xs breakpoint)", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: expect.objectContaining({ xs: "row" }),
      }),
      expect.anything()
    );
  });

  it("desktop layout structure (md breakpoint)", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: expect.objectContaining({ md: "column" }),
      }),
      expect.anything()
    );
  });

  it("responsive bar border styling", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        sx: expect.objectContaining({
          borderTop: expect.objectContaining({
            md: "0",
            xs: "2px solid black",
          }),
          borderRight: expect.objectContaining({ md: "2px solid black" }),
        }),
      }),
      expect.anything()
    );
  });

  it("children rendering within navigation bar", () => {
    render(
      <Navigation slides={slidesMock}>
        <div data-testid="test-child" />
      </Navigation>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("content area scrolling behavior", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Box).toHaveBeenCalledWith(
      expect.objectContaining({
        sx: expect.objectContaining({ overflowX: "hidden", overflowY: "auto" }),
      }),
      expect.anything()
    );
  });

  it("slide buttons styling", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Button).toHaveBeenCalledWith(
      expect.objectContaining({
        sx: { flex: 1, borderRadius: 0 },
      }),
      expect.anything()
    );
  });

  it("maintains navigation persistence", () => {
    const { rerender } = render(<Navigation slides={slidesMock} />);

    fireEvent.click(screen.getByText("Slide 2"));
    rerender(<Navigation slides={slidesMock} />);
    expect(screen.getByTestId("slide-2")).toBeInTheDocument();
  });

  it("responsive layout (portrait-landscape) config", () => {
    render(<Navigation slides={slidesMock} />);

    expect(Box).toHaveBeenCalledWith(
      expect.objectContaining({
        boxSizing: "border-box",
        width: "100svw",
        height: "100svh",
        display: "flex",
        flexDirection: expect.objectContaining({
          xs: "column",
          sm: "column",
          md: "row-reverse",
        }),
      }),
      expect.anything()
    );
  });
});
