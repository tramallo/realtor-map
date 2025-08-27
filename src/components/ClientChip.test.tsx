import { ComponentProps } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, Mocked } from "vitest";
import { Chip, CircularProgress } from "@mui/material";

import ClientChip from "./ClientChip";
import { Client } from "../utils/data-schema";
import CustomModal from "./CustomModal";
import ViewClient from "./clients/ViewClient";
import { ClientStore } from "../stores/clientsStore";

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

const clientStoreMock: Mocked<ClientStore> = {
  clients: {},
  searchResults: {},
  searchClients: vi.fn(),
  createClient: vi.fn(),
  fetchClient: vi.fn(),
  fetchClients: vi.fn(),
  deleteClient: vi.fn(),
  updateClient: vi.fn(),
}
vi.mock('../stores/clientsStore', async (importOriginal) => {
  const originalClientStore = await importOriginal<ClientStore>();

  return {
    ...originalClientStore,
    useClientStore: vi.fn((selector?: (state: ClientStore) => any) => {
      return selector ? selector(clientStoreMock) : clientStoreMock
    })
  }
})

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

vi.mock("./clients/ViewClient", () => ({
  default: vi.fn((props: ComponentProps<typeof ViewClient>) => (
    <div data-testid={`view-client-${props.clientId}`} />
  )),
}));

describe("ClientChip", () => {
  beforeEach(() => {
    clientStoreMock.clients = {};
    clientStoreMock.searchResults = {};
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });
    render(<ClientChip clientId={1} />);
    expect(screen.getByTestId("mui-chip")).toBeInTheDocument();
  });

  it("displays loading spinner when fetching person data", () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

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

  it("shows client name when fetch succeeds", async () => {
    const client1 = { id: 1, name: "John Doe" } as Client;
    clientStoreMock.clients[client1.id] = client1;
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined } as any)

    render(<ClientChip clientId={client1.id} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({ label: client1.name }),
        expect.anything()
      );
    });
  });

  it("displays error message when fetch fails", async () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ error: new Error("error message") });

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

  it("shows 'Client (id) not found' when client is not in cache", async () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    await waitFor(() => {
      expect(Chip).toHaveBeenCalledWith(
        expect.objectContaining({
          label: "Client (1) not found",
        }),
        expect.anything()
      );
    });
  });

  it("opens ViewClient modal when chip is clicked", async () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.getByTestId("custom-modal")).toBeInTheDocument();
      expect(screen.getByTestId("view-client-1")).toBeInTheDocument();
    });
  });

  it("closes modal when CustomModal close is triggered", async () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-client-1")).toBeInTheDocument();
      expect(
        screen.queryByTestId("custom-modal-close-button")
      ).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("custom-modal-close-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("view-client-1")).not.toBeInTheDocument();
    });
  });

  it("displays ViewClient component in modal with correct personId", async () => {
    const client1 = { id: 1, name: "John Doe" } as Client;
    clientStoreMock.clients[client1.id] = client1;
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined } as any)

    render(<ClientChip clientId={1} />);

    fireEvent.click(screen.getByTestId("mui-chip"));
    await waitFor(() => {
      expect(screen.queryByTestId("view-client-1")).toBeInTheDocument();
      expect(ViewClient).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 1,
        }),
        expect.anything()
      );
    });
  });

  it("calls onClose callback when mui Chip delete button is clicked", async () => {
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });
    const onCloseMock = vi.fn();

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
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

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
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

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
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });
    clientStoreMock.fetchClient.mockResolvedValueOnce({ data: undefined });

    const { rerender } = render(<ClientChip clientId={1} />);

    await waitFor(() => expect(clientStoreMock.fetchClient).toHaveBeenCalledWith(1));
    rerender(<ClientChip clientId={2} />);
    await waitFor(() => expect(clientStoreMock.fetchClient).toHaveBeenCalledWith(2));
  });
});
