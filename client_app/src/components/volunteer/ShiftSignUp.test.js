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
        <button onClick={() => handleShiftToggle(shiftData.shift)}>Select test shift</button>
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
  expect(await screen.findByRole("button", { name: "Select test shift" })).toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

test("shows a submission error, preserves selected shifts, and allows retry", async () => {
  serviceCommitmentAPI.addCommitments
    .mockRejectedValueOnce(new Error("Network unavailable"))
    .mockResolvedValueOnce([{ success: true }]);
  render(<VolunteerShiftSignup />);
  fireEvent.click(await screen.findByRole("button", { name: "Select test shift" }));
  fireEvent.click(screen.getByRole("button", { name: "Sign up for 1 shift" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Your selected shifts are still here");
  expect(screen.getByRole("button", { name: "Sign up for 1 shift" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Sign up for 1 shift" }));
  await waitFor(() => expect(serviceCommitmentAPI.addCommitments).toHaveBeenCalledTimes(2));
  expect(await screen.findByText("Sign-up results")).toBeInTheDocument();
});
