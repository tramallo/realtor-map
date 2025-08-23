import { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Chip, CircularProgress } from "@mui/material";

import ClientChip from "./ClientChip";
import { Client } from "../utils/data-schema";
import CustomModal from "./CustomModal";
import ViewClient from "./clients/ViewClient";

// mock dependencies
vi.mock("@mui/material", () => ({
  Chip: vi.fn((props: ComponentProps<typeof Chip>) => (
    <div data-testid="mui-chip" {...props}>
      {props.onDelete && (
        <button data-testid="mui-chip-delete-button" onClick={props.onDelete} />
      )}
    </div>
  )),
  CircularProgress: vi.fn(() => <div data-testid="circular-progress" />),
}));

let personsMock = {} as Record<Client["id"], Client>;
const fetchPersonMock = vi.fn();
vi.mock("../stores/personsStore", async (requireActual) => {
  const actual = await requireActual<typeof import("../stores/clientsStore")>();

  return {
    ...actual,
    usePersonStore: (selectorFunction: (args: unknown) => unknown) => {
      return selectorFunction({
        persons: personsMock,
        fetchPerson: fetchPersonMock,
      });
    },
  };
});

vi.mock("./CustomModal", () => ({
  default: vi.fn((props: ComponentProps<typeof CustomModal>) => (
    <div data-testid={`custom-modal`}>
      {props.open && (
        <>
          <button
            data-testid="custom-modal-close-button"
            onClick={props.onClose}
          />
          {props.children}
        </>
      )}
    </div>
  )),
}));

vi.mock("./persons/ViewPerson", () => ({
  default: vi.fn((props: ComponentProps<typeof ViewClient>) => (
    <div data-testid={`view-person-${props.clientId}`} />
  )),
}));

describe("PersonChip", () => {
  beforeEach(() => {
    personsMock = {};
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });
    render(<ClientChip clientId={1} />);
    expect(screen.getByTestId("mui-chip")).toBeInTheDocument();
  });

  it("displays loading spinner when fetching person data", () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    expect(Chip).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: undefined,
      }),
      expect.anything()
    );
    expect(Chip).toHaveBeenCalledWith(
      expect.objectContaining({
        icon: expect.objectContaining({ type: CircularProgress }),
      }),
      expect.anything()
    );
  });

  it("shows person name when fetch succeeds", async () => {
    const personId = 1;
    const personName = "John Doe";
    personsMock[personId] = { id: personId, name: personName } as Client;
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={personId} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({ label: personName }),
        expect.anything()
      );
    });
  });

  it("displays error message when fetch fails", async () => {
    fetchPersonMock.mockResolvedValueOnce({
      error: new Error("error message"),
    });

    render(<ClientChip clientId={1} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Error",
        }),
        expect.anything()
      );
    });
  });

  it("shows 'Not found' when person is not in cache", async () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Not found",
        }),
        expect.anything()
      );
    });
  });

  it("opens view person modal when chip is clicked", async () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
      expect(screen.getByTestId("view-person-1")).toBeInTheDocument();
    });
  });

  it("closes modal when CustomModal onClose is triggered", async () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-person-1")).toBeInTheDocument();
      expect(
        screen.queryByTestId("custom-modal-close-button")
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("custom-modal-close-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("view-person-1")).not.toBeInTheDocument();
    });
  });

  it("displays ViewPerson component in modal with correct personId", async () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-person-1")).toBeInTheDocument();
      expect(ViewClient).toHaveBeenCalledWith(
        expect.objectContaining({
          personId: 1,
        }),
        expect.anything()
      );
    });
  });

  it("calls onClose callback when mui Chip delete button is clicked", async () => {
    const onCloseMock = vi.fn();
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} onClose={onCloseMock} />);

    expect(onCloseMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(
        screen.queryByTestId("mui-chip-delete-button")
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("mui-chip-delete-button"));
    await waitFor(() => {
      expect(onCloseMock).toHaveBeenCalledOnce();
    });
  });

  it("hides delete button when onClose prop is not provided", () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    expect(Chip).toHaveBeenCalledWith(
      expect.objectContaining({ onDelete: undefined }),
      expect.anything()
    );
    expect(
      screen.queryByTestId("mui-chip-delete-button")
    ).not.toBeInTheDocument();
  });

  it("disables onClose functionality during data loading", async () => {
    fetchPersonMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: undefined }), 300);
        })
    );

    render(<ClientChip clientId={1} onClose={vi.fn()} />);

    expect(Chip).toHaveBeenCalledWith(
      expect.objectContaining({ onDelete: undefined }),
      expect.anything()
    );
    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({ onDelete: expect.any(Function) }),
        expect.anything()
      );
    });
  });

  it("triggers data refetch when personId prop changes", async () => {
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });
    fetchPersonMock.mockResolvedValueOnce({ data: undefined });

    const { rerender } = render(<ClientChip clientId={1} />);

    await waitFor(() => expect(fetchPersonMock).toHaveBeenCalledWith(1));
    rerender(<ClientChip clientId={2} />);
    await waitFor(() => expect(fetchPersonMock).toHaveBeenCalledWith(2));
  });
});
