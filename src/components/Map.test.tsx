import { ComponentProps } from "react";
import { LatLngBounds } from "leaflet";
import { AttributionControl, MapContainer, TileLayer } from "react-leaflet";
import { Stack } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { MemoMap } from "./Map";

// mock dependencies
vi.mock("react-leaflet", () => ({
  MapContainer: vi.fn(({ children }: ComponentProps<typeof MapContainer>) => (
    <div data-testid="map-container">{children}</div>
  )),
  TileLayer: vi.fn((props: ComponentProps<typeof TileLayer>) => (
    <div data-testid="tile-layer" data-url={props.url} />
  )),
  AttributionControl: vi.fn(() => <div data-testid="attribution-control" />),
}));

vi.mock("@mui/material", () => ({
  Stack: vi.fn((props) => <div data-testid="stack" {...props} />),
  Typography: vi.fn((props) => <p data-testid="typography" {...props} />),
  CircularProgress: vi.fn(() => <div data-testid="circular-progress" />),
}));

vi.mock("../utils/mapServicesSchemas", () => ({
  MapTilesService: vi.fn(),
}));

const mapTilesServiceMock = {
  getMapTilesUrl: vi.fn(),
  attribution: "Test Attribution",
};

describe("Map", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mapTilesServiceMock.getMapTilesUrl.mockResolvedValue({
      data: "https://tile.test/{z}/{x}/{y}.png",
      error: null,
    });
  });

  it("renders a loading spinner while fetching the map tiles URL", async () => {
    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    expect(screen.getByTestId("circular-progress")).toBeInTheDocument();
    await waitFor(() =>
      expect(mapTilesServiceMock.getMapTilesUrl).toHaveBeenCalled()
    );
  });

  it("displays an error message when map tiles URL fetch fails", async () => {
    mapTilesServiceMock.getMapTilesUrl.mockResolvedValueOnce({
      error: new Error("Fetch failed"),
    });

    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    await waitFor(() => {
      expect(screen.getByText(/fetch failed/i)).toBeInTheDocument();
    });
  });

  it("renders MapContainer with TileLayer when map tiles URL is successfully fetched", async () => {
    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    await waitFor(() => {
      expect(screen.getByTestId("map-container")).toBeInTheDocument();
      expect(screen.getByTestId("tile-layer")).toHaveAttribute(
        "data-url",
        "https://tile.test/{z}/{x}/{y}.png"
      );
    });
  });

  it("applies custom position, zoom, and bounds from props when provided", async () => {
    const customProps = {
      position: { lat: 40.7128, lng: -74.006 },
      zoom: 10,
      maxBounds: new LatLngBounds([40.6, -74.1], [40.8, -73.9]),
    };

    render(<MemoMap mapTilesService={mapTilesServiceMock} {...customProps} />);

    await waitFor(() => {
      expect(MapContainer).toHaveBeenCalledWith(
        expect.objectContaining({
          center: expect.objectContaining(customProps.position),
          zoom: customProps.zoom,
          maxBounds: expect.objectContaining(customProps.maxBounds),
        }),
        expect.anything()
      );
    });
  });

  it("renders children components inside the MapContainer", async () => {
    render(
      <MemoMap mapTilesService={mapTilesServiceMock}>
        <div data-testid="test-child" />
      </MemoMap>
    );

    await waitFor(() => {
      expect(screen.getByTestId("test-child")).toBeInTheDocument();
    });
  });

  it("updates map tiles URL when mapTilesService prop changes", async () => {
    const { rerender } = render(
      <MemoMap mapTilesService={mapTilesServiceMock} />
    );

    const newMapTilesService = {
      ...mapTilesServiceMock,
      getMapTilesUrl: vi
        .fn()
        .mockResolvedValue({ data: "new-url", error: null }),
    };

    rerender(<MemoMap mapTilesService={newMapTilesService} />);

    await waitFor(() => {
      expect(newMapTilesService.getMapTilesUrl).toHaveBeenCalled();
      expect(TileLayer).toHaveBeenCalledWith(
        expect.objectContaining({ url: "new-url" }),
        expect.anything()
      );
    });
  });

  it("displays correct attribution from mapTilesService in TileLayer", async () => {
    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    await waitFor(() => {
      expect(TileLayer).toHaveBeenCalledWith(
        expect.objectContaining({
          attribution: "Test Attribution",
        }),
        expect.anything()
      );
    });
  });

  it("applies correct container styling", async () => {
    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    expect(Stack).toHaveBeenCalledWith(
      expect.objectContaining({
        width: "100%",
        height: "100%",
        border: "2px solid black",
      }),
      expect.anything()
    );
  });

  it("sets AttributionControl in topleft position", async () => {
    render(<MemoMap mapTilesService={mapTilesServiceMock} />);

    await waitFor(() => {
      expect(screen.getByTestId("attribution-control")).toBeInTheDocument();
    });
    expect(AttributionControl).toHaveBeenCalledWith(
      expect.objectContaining({
        position: "topleft",
      }),
      expect.anything()
    );
  });
});
