import { render, screen } from "@testing-library/react";
import { waitlistAPI } from "../../api/waitlist";
import ViewShifts from "./ViewShifts";

jest.mock("react-router-dom", () => ({
  useParams: () => ({ shelterId: "shelter-1" }),
}));

jest.mock("../../api/waitlist", () => ({
  waitlistAPI: {
    getForShift: jest.fn(),
  },
}));

jest.mock("../../formatting/FormatDateTime.js", () => ({
  formatDate: jest.fn(() => "October 11, 2026"),
  formatTime: jest.fn(() => "9:00 AM"),
}));

jest.mock("./ShiftUserInfoDisplay", () => () => null);
jest.mock("./ShiftWaitlistModal", () => () => null);
jest.mock("./EditRequestModal.js", () => ({ EditRequestModal: () => null }));
jest.mock("./CancelRequestModal.js", () => ({ CancelRequestModal: () => null }));

describe("ViewShifts waitlist counts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads and displays a waitlist count for each shift", async () => {
    waitlistAPI.getForShift.mockResolvedValue([{ _id: "entry-1" }, { _id: "entry-2" }]);

    render(
      <ViewShifts
        shiftDetailsData={[
          {
            _id: "shift-1",
            shift_name: "Dinner Service",
            shift_start: 1760000000000,
            shift_end: 1760003600000,
            volunteers: [],
            required_volunteer_count: 2,
          },
        ]}
      />,
    );

    expect(await screen.findByText("Waitlist 2")).toBeInTheDocument();
    expect(waitlistAPI.getForShift).toHaveBeenCalledWith("shelter-1", "shift-1");
  });
});
