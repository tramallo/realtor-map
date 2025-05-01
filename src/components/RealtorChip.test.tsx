import { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Chip, CircularProgress } from "@mui/material";

import RealtorChip from "./RealtorChip";
import { RealtorData } from "../utils/domainSchemas";
import CustomModal from "./CustomModal";
import ViewRealtor from "./realtors/ViewRealtor";

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

let realtorsMock = {} as Record<RealtorData["id"], RealtorData>;
const fetchRealtorMock = vi.fn();
vi.mock("../stores/realtorsStore", async (requireActual) => {
  const actual = await requireActual<
    typeof import("../stores/realtorsStore")
  >();

  return {
    ...actual,
    useRealtorStore: (selectorFunction: (args: unknown) => unknown) => {
      return selectorFunction({
        realtors: realtorsMock,
        fetchRealtor: fetchRealtorMock,
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

vi.mock("./realtors/ViewRealtor", () => ({
  default: vi.fn((props: ComponentProps<typeof ViewRealtor>) => (
    <div data-testid={`view-realtor-${props.realtorId}`} />
  )),
}));

describe("RealtorChip", () => {
  beforeEach(() => {
    realtorsMock = {};
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    expect(screen.getByTestId("mui-chip")).toBeInTheDocument();
  });

  it("displays loading spinner when fetching realtor data", () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

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

  it("shows realtor name when fetch succeeds", async () => {
    const realtorId = 1;
    const realtorName = "John Doe";
    realtorsMock[realtorId] = {
      id: realtorId,
      name: realtorName,
    } as RealtorData;
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={realtorId} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({ label: realtorName }),
        expect.anything()
      );
    });
  });

  it("displays error message when fetch fails", async () => {
    fetchRealtorMock.mockResolvedValueOnce({
      error: new Error("error message"),
    });

    render(<RealtorChip realtorId={1} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Error",
        }),
        expect.anything()
      );
    });
  });

  it("shows 'Not found' when realtor is not in cache", async () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Not found",
        }),
        expect.anything()
      );
    });
  });

  it("opens view realtor modal when chip is clicked", async () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
      expect(screen.getByTestId("view-realtor-1")).toBeInTheDocument();
    });
  });

  it("closes modal when CustomModal onClose is triggered", async () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-realtor-1")).toBeInTheDocument();
      expect(
        screen.queryByTestId("custom-modal-close-button")
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("custom-modal-close-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("view-realtor-1")).not.toBeInTheDocument();
    });
  });

  it("displays ViewRealtor component in modal with correct realtorId", async () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-realtor-1")).toBeInTheDocument();
      expect(ViewRealtor).toHaveBeenCalledWith(
        expect.objectContaining({
          realtorId: 1,
        }),
        expect.anything()
      );
    });
  });

  it("calls onClose callback when mui Chip delete button is clicked", async () => {
    const onCloseMock = vi.fn();
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} onClose={onCloseMock} />);

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
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    render(<RealtorChip realtorId={1} />);

    expect(Chip).toHaveBeenCalledWith(
      expect.objectContaining({ onDelete: undefined }),
      expect.anything()
    );
    expect(
      screen.queryByTestId("mui-chip-delete-button")
    ).not.toBeInTheDocument();
  });

  it("disables onClose functionality during data loading", async () => {
    fetchRealtorMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: undefined }), 300);
        })
    );

    render(<RealtorChip realtorId={1} onClose={vi.fn()} />);

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

  it("triggers data refetch when realtorId prop changes", async () => {
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });
    fetchRealtorMock.mockResolvedValueOnce({ data: undefined });

    const { rerender } = render(<RealtorChip realtorId={1} />);

    await waitFor(() => expect(fetchRealtorMock).toHaveBeenCalledWith(1));
    rerender(<RealtorChip realtorId={2} />);
    await waitFor(() => expect(fetchRealtorMock).toHaveBeenCalledWith(2));
  });
});
