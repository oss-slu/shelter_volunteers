import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import NearbySheltersMap from "./NearbySheltersMap";
import { shelterAPI } from "../../api/shelter";
import { serviceShiftAPI } from "../../api/serviceShift";

jest.mock("react-leaflet", () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  CircleMarker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
  useMap: () => ({ fitBounds: jest.fn(), setView: jest.fn() }),
}));
jest.mock("leaflet/dist/leaflet.css", () => ({}));
jest.mock("../../api/shelter", () => ({ shelterAPI: { getShelters: jest.fn() } }));
jest.mock("../../api/serviceShift", () => ({ serviceShiftAPI: { getFutureShifts: jest.fn() } }));

const shelter = (id, name, lat, lng) => ({
  _id: id,
  name,
  address: { street1: "1 Main St", city: "St. Louis", state: "MO", postal_code: "63101", coordinates: { latitude: lat, longitude: lng } },
});
const shift = (id, shelterId) => ({
  _id: id,
  shelter_id: shelterId,
  shift_start: Date.now() + 86400000,
  shift_end: Date.now() + 86400000 + 4 * 3600000,
  volunteer_count: 0,
  max_volunteer_count: 4,
  can_sign_up: true,
});

function renderMap() {
  return render(
    <MemoryRouter>
      <NearbySheltersMap />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  shelterAPI.getShelters.mockResolvedValue([
    shelter("far", "Florissant Valley Shelter", 38.801, -90.322),
    shelter("near", "Gateway Harbor Shelter", 38.6318, -90.1925),
    shelter("idle", "Quiet Shelter", 38.61, -90.21),
  ]);
  serviceShiftAPI.getFutureShifts.mockResolvedValue([
    shift("1", "far"),
    shift("2", "far"),
    shift("3", "near"),
  ]);
});

afterEach(() => {
  delete window.navigator.geolocation;
});

it("plots every shelter and lists the ones with open shifts", async () => {
  renderMap();
  expect(await screen.findByText("2 shelters with open shifts")).toBeInTheDocument();
  expect(screen.getAllByTestId("marker")).toHaveLength(3);

  const items = screen.getAllByRole("link", { name: /open shift/ });
  expect(items.map((a) => a.getAttribute("href"))).toEqual([
    "/volunteer-dashboard/shelters#shelter-far",
    "/volunteer-dashboard/shelters#shelter-near",
  ]);
  expect(screen.getByText("No open shifts right now")).toBeInTheDocument();
});

it("orders by distance after the volunteer shares their location", async () => {
  window.navigator.geolocation = {
    getCurrentPosition: jest.fn((success) => success({ coords: { latitude: 38.627, longitude: -90.1994 } })),
  };
  renderMap();
  await screen.findByText("2 shelters with open shifts");

  fireEvent.click(screen.getByRole("button", { name: /use my location/i }));

  expect(await screen.findByText("Closest with open shifts")).toBeInTheDocument();
  const items = screen.getAllByRole("link", { name: /open shift/ });
  expect(within(items[0]).getByText("Gateway Harbor Shelter")).toBeInTheDocument();
  expect(within(items[1]).getByText("Florissant Valley Shelter")).toBeInTheDocument();
  expect(within(items[0]).getByText(/mi$/)).toBeInTheDocument();
  expect(screen.getByText("You are here")).toBeInTheDocument();
});

it("explains when location access is denied", async () => {
  window.navigator.geolocation = {
    getCurrentPosition: jest.fn((_success, error) => error({ code: 1 })),
  };
  renderMap();
  await screen.findByText("2 shelters with open shifts");
  fireEvent.click(screen.getByRole("button", { name: /use my location/i }));
  expect(await screen.findByText(/couldn't get your location/i)).toBeInTheDocument();
});

it("shows a message when shelters cannot be loaded", async () => {
  shelterAPI.getShelters.mockRejectedValue(new Error("offline"));
  renderMap();
  expect(await screen.findByText("Shelter locations are unavailable right now.")).toBeInTheDocument();
});
