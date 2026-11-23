import { render, screen, waitFor } from "@testing-library/react";
import ShelterMap, { toMapPoints } from "./ShelterMap";
import { shelterAPI } from "../api/shelter";

// Leaflet needs a real browser canvas; render plain elements instead.
jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({ fitBounds: jest.fn(), setView: jest.fn() }),
}));
jest.mock("leaflet/dist/leaflet.css", () => ({}));
jest.mock("../api/shelter", () => ({
  shelterAPI: { getShelters: jest.fn() },
}));

const shelter = (name, coordinates, extra = {}) => ({
  _id: name,
  name,
  address: {
    street1: "1000 Washington Ave",
    city: "St. Louis",
    state: "MO",
    postal_code: "63101",
    coordinates,
    ...extra,
  },
});

describe("toMapPoints", () => {
  it("keeps shelters with valid coordinates and formats the address", () => {
    const points = toMapPoints([
      shelter("Gateway", { latitude: 38.63, longitude: -90.19 }),
    ]);
    expect(points).toEqual([
      {
        id: "Gateway",
        name: "Gateway",
        street: "1000 Washington Ave",
        locality: "St. Louis, MO 63101",
        position: [38.63, -90.19],
      },
    ]);
  });

  it("drops shelters with missing or invalid coordinates", () => {
    const points = toMapPoints([
      shelter("No coords", {}),
      shelter("Null coords", { latitude: null, longitude: null }),
      shelter("Text coords", { latitude: "abc", longitude: "-90" }),
      shelter("Out of range", { latitude: 120, longitude: -90 }),
      { name: "No address" },
    ]);
    expect(points).toEqual([]);
  });

  it("returns an empty list for non-array input", () => {
    expect(toMapPoints(undefined)).toEqual([]);
    expect(toMapPoints({ error: "x" })).toEqual([]);
  });
});

describe("ShelterMap", () => {
  afterEach(() => jest.clearAllMocks());

  it("renders a marker per located shelter", async () => {
    shelterAPI.getShelters.mockResolvedValue([
      shelter("Gateway Harbor Shelter", { latitude: 38.63, longitude: -90.19 }),
      shelter("Soulard Community Haven", { latitude: 38.61, longitude: -90.21 }),
      shelter("Unmapped", {}),
    ]);

    render(<ShelterMap />);

    expect(await screen.findByText("2 partner shelters across the region")).toBeInTheDocument();
    expect(screen.getAllByTestId("marker")).toHaveLength(2);
    expect(screen.getByText("Gateway Harbor Shelter")).toBeInTheDocument();
    expect(screen.queryByText("Unmapped")).not.toBeInTheDocument();
  });

  it("shows a fallback message when shelters fail to load", async () => {
    shelterAPI.getShelters.mockRejectedValue(new Error("offline"));

    render(<ShelterMap />);

    await waitFor(() =>
      expect(
        screen.getByText("Shelter locations are unavailable right now."),
      ).toBeInTheDocument(),
    );
    expect(screen.queryAllByTestId("marker")).toHaveLength(0);
  });
});
