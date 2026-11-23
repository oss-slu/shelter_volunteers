import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import VolunteerShiftSignup from "./ShiftSignUp";
import { shelterAPI } from "../../api/shelter";
import { serviceShiftAPI } from "../../api/serviceShift";
import { serviceCommitmentAPI } from "../../api/serviceCommitment";
import { waitlistAPI } from "../../api/waitlist";

jest.mock("../../api/shelter", () => ({ shelterAPI: { getShelters: jest.fn() } }));
jest.mock("../../api/serviceShift", () => ({ serviceShiftAPI: { getFutureShifts: jest.fn() } }));
jest.mock("../../api/serviceCommitment", () => ({
  serviceCommitmentAPI: { getFutureCommitments: jest.fn(), addCommitments: jest.fn() },
}));
jest.mock("../../api/waitlist", () => ({ waitlistAPI: { getMine: jest.fn() } }));
jest.mock("../../authentication/user", () => ({
  getUser: () => ({ email: "volunteer@example.com" }),
}));
jest.mock("./DesktopShiftRow", () => ({
  DesktopShiftRow: ({ shiftData, handleShiftToggle }) => (
    <tr>
      <td>
        <button
          type="button"
          aria-pressed={shiftData.isSelected}
          disabled={!shiftData.canInteract}
          onClick={() => handleShiftToggle(shiftData.shift)}>
          Select test shift {shiftData.shift.shift_name}
        </button>
      </td>
    </tr>
  ),
}));
jest.mock("./MobileShiftCard", () => ({ MobileShiftCard: () => null }));
jest.mock("./SignUpResults", () => () => <div>Sign-up results</div>);

const shift = {
  _id: "shift-1",
  shelter_id: "shelter-1",
  shift_name: "Dinner",
  shift_start: Date.now() + 86400000,
  shift_end: Date.now() + 90000000,
  volunteer_count: 0,
  required_volunteer_count: 2,
  max_volunteer_count: 2,
  can_sign_up: true,
  volunteers: [],
};

beforeEach(() => {
  shelterAPI.getShelters.mockResolvedValue([{ _id: "shelter-1", name: "Community Shelter" }]);
  serviceShiftAPI.getFutureShifts.mockResolvedValue([shift]);
  serviceCommitmentAPI.getFutureCommitments.mockResolvedValue([]);
  waitlistAPI.getMine.mockResolvedValue([]);
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.resetAllMocks();
  console.error.mockRestore();
});

test("shows a load error and retries instead of showing an empty shift list", async () => {
  serviceShiftAPI.getFutureShifts.mockRejectedValueOnce(new Error("Network unavailable"));
  render(<VolunteerShiftSignup />);
  expect(await screen.findByRole("alert")).toHaveTextContent("could not load the available shifts");
  expect(screen.queryByText(/There are no open shifts/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Retry loading shifts" }));
  expect(await screen.findByRole("button", { name: "Select test shift Dinner" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows a submission error, preserves selected shifts, and allows retry", async () => {
  serviceCommitmentAPI.addCommitments
    .mockRejectedValueOnce(new Error("Network unavailable"))
    .mockResolvedValueOnce([{ success: true }]);
  render(<VolunteerShiftSignup />);
  fireEvent.click(await screen.findByRole("button", { name: "Select test shift Dinner" }));
  fireEvent.click(screen.getByRole("button", { name: "Sign up for 1 shift" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Your selected shifts are still here");
  expect(screen.getByRole("button", { name: "Sign up for 1 shift" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Sign up for 1 shift" }));
  await waitFor(() => expect(serviceCommitmentAPI.addCommitments).toHaveBeenCalledTimes(2));
  expect(await screen.findByText("Sign-up results")).toBeInTheDocument();
});

test("renders available shifts in date order and lets a volunteer select and deselect one", async () => {
  const earlierShift = { ...shift, _id: "early", shift_name: "Breakfast" };
  const laterShift = {
    ...shift,
    _id: "late",
    shift_name: "Lunch",
    shift_start: shift.shift_end + 3600000,
    shift_end: shift.shift_end + 7200000,
  };
  serviceShiftAPI.getFutureShifts.mockResolvedValue([laterShift, earlierShift]);

  render(<VolunteerShiftSignup />);

  const shiftButtons = await screen.findAllByRole("button", { name: /Select test shift/ });
  expect(shiftButtons.map((button) => button.textContent)).toEqual([
    "Select test shift Breakfast",
    "Select test shift Lunch",
  ]);
  expect(screen.getByRole("button", { name: "Sign up for shifts" })).toBeDisabled();

  fireEvent.click(shiftButtons[0]);
  expect(shiftButtons[0]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Sign up for 1 shift" })).toBeEnabled();

  fireEvent.click(shiftButtons[0]);
  expect(shiftButtons[0]).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByRole("button", { name: "Sign up for shifts" })).toBeDisabled();
});

test("submits the selected shift and shows the results", async () => {
  serviceCommitmentAPI.addCommitments.mockResolvedValue([{ success: true }]);
  render(<VolunteerShiftSignup />);

  fireEvent.click(await screen.findByRole("button", { name: "Select test shift Dinner" }));
  fireEvent.click(screen.getByRole("button", { name: "Sign up for 1 shift" }));

  await waitFor(() =>
    expect(serviceCommitmentAPI.addCommitments).toHaveBeenCalledWith([
      { volunteer_id: "volunteer@example.com", service_shift_id: "shift-1" },
    ]),
  );
  expect(await screen.findByText("Sign-up results")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign up for shifts" })).toBeDisabled();
});

test("shows an empty state when no shifts are available", async () => {
  serviceShiftAPI.getFutureShifts.mockResolvedValue([]);
  render(<VolunteerShiftSignup />);

  expect(await screen.findByText(/There are no open shifts to sign up for right now/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Select test shift/ })).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Sign up for shifts" })).toBeDisabled();
});
