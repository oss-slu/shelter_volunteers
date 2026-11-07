import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RepeatableShiftsScreen from "./RepeatableShiftsScreen";
import { shelterAPI } from "../../api/shelter";
import { repeatableShiftsApi } from "../../api/repeatableShiftsApi";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ shelterId: "s1" }),
}));
jest.mock("../../api/shelter", () => ({
  shelterAPI: { getShelter: jest.fn() },
}));
jest.mock("../../api/repeatableShiftsApi", () => ({
  repeatableShiftsApi: { getRepeatableShifts: jest.fn(), setRepeatableShifts: jest.fn() },
}));

const shift = (id, name, startHour) => ({
  id,
  shiftName: name,
  shiftStart: startHour * 3600000,
  shiftEnd: (startHour + 3) * 3600000,
  requiredVolunteerCount: 2,
  maxVolunteerCount: 4,
  instructions: "",
  instructionsRecurring: false,
});

beforeEach(() => {
  jest.clearAllMocks();
  shelterAPI.getShelter.mockResolvedValue({ _id: "s1", name: "Gateway Harbor Shelter" });
});

it("shows the shelter name and an empty state when there are no shifts", async () => {
  repeatableShiftsApi.getRepeatableShifts.mockResolvedValue([]);
  render(<RepeatableShiftsScreen />);

  expect(await screen.findByText("Gateway Harbor Shelter")).toBeInTheDocument();
  expect(await screen.findByText(/no repeatable shifts yet/i)).toBeInTheDocument();
  expect(screen.getByText("0 shifts per day")).toBeInTheDocument();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
});

it("lists existing shifts and adds a new row", async () => {
  repeatableShiftsApi.getRepeatableShifts.mockResolvedValue([
    shift("r1", "Breakfast", 7),
    shift("r2", "Overnight", 21),
  ]);
  render(<RepeatableShiftsScreen />);

  expect(await screen.findByDisplayValue("Breakfast")).toBeInTheDocument();
  expect(screen.getByDisplayValue("Overnight")).toBeInTheDocument();
  expect(screen.getByText("2 shifts per day")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /add shift/i }));
  expect(screen.getByText("3 shifts per day")).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: /delete/i })).toHaveLength(3);
});

it("submits the schedule and shows server errors in an alert", async () => {
  repeatableShiftsApi.getRepeatableShifts.mockResolvedValue([shift("r1", "Breakfast", 7)]);
  repeatableShiftsApi.setRepeatableShifts.mockRejectedValue({
    generic_errors: [],
    keyed_errors: { 0: { shift_name: ["Name is required."] } },
  });
  render(<RepeatableShiftsScreen />);
  await screen.findByDisplayValue("Breakfast");

  fireEvent.click(screen.getByRole("button", { name: /submit schedule/i }));

  await waitFor(() => expect(repeatableShiftsApi.setRepeatableShifts).toHaveBeenCalledTimes(1));
  expect(repeatableShiftsApi.setRepeatableShifts.mock.calls[0][0]).toBe("s1");
  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("Shift 1: Name is required.");
});

it("derives the duration from the start and end times", async () => {
  repeatableShiftsApi.getRepeatableShifts.mockResolvedValue([shift("r1", "Breakfast", 7)]);
  const { container } = render(<RepeatableShiftsScreen />);
  await screen.findByDisplayValue("Breakfast");

  const duration = screen.getByLabelText("Duration in hours (shift 1)");
  expect(duration).toBeDisabled();
  expect(duration).toHaveValue(3);

  const [, endTime] = container.querySelectorAll('input[type="time"]');
  fireEvent.change(endTime, { target: { value: "12:30" } });
  expect(duration).toHaveValue(5.5);
});
