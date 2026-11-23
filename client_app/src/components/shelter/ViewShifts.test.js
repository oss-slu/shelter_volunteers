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

describe("ViewShifts chronological ordering", () => {
  const makeShift = (name, year, month, day, hour) => ({
    _id: name,
    shift_name: name,
    shift_start: new Date(year, month - 1, day, hour).getTime(),
    shift_end: new Date(year, month - 1, day, hour + 1).getTime(),
    volunteers: [],
    required_volunteer_count: 2,
  });

  beforeEach(() => {
    waitlistAPI.getForShift.mockResolvedValue([]);
  });

  it("orders shuffled dates across months and years, then times within each day", async () => {
    const shifts = Object.freeze([
      makeShift("January", 2027, 1, 1, 9),
      makeShift("December evening", 2026, 12, 31, 17),
      makeShift("November", 2026, 11, 30, 9),
      makeShift("December morning", 2026, 12, 31, 9),
    ]);
    const { container } = render(<ViewShifts shiftDetailsData={shifts} />);

    await screen.findAllByText("Waitlist 0");
    expect(
      Array.from(container.querySelectorAll(".date-header"), (node) => node.textContent),
    ).toEqual(["Nov 30, 2026", "Dec 31, 2026", "Jan 01, 2027"]);
    expect(
      screen
        .getAllByRole("button", { name: /^Edit / })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Edit November", "Edit December morning", "Edit December evening", "Edit January"]);
    expect(shifts[0].shift_name).toBe("January");
  });

  it("reorders the display when refreshed shift dates change", async () => {
    const first = makeShift("First", 2026, 11, 1, 9);
    const second = makeShift("Second", 2026, 11, 2, 9);
    const { rerender } = render(<ViewShifts shiftDetailsData={[first, second]} />);
    await screen.findAllByText("Waitlist 0");

    rerender(<ViewShifts shiftDetailsData={[makeShift("First", 2026, 11, 3, 9), second]} />);
    await screen.findAllByText("Waitlist 0");
    expect(
      screen
        .getAllByRole("button", { name: /^Edit / })
        .map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Edit Second", "Edit First"]);
  });
});
