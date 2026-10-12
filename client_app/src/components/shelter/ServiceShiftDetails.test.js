import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServiceShiftDetails from "./ServiceShiftDetails";

jest.mock("../../formatting/FormatDateTime", () => ({
  formatTime: jest.fn(() => "9:00 AM"),
}));

describe("ServiceShiftDetails", () => {
  it("shows the waitlist count and opens the waitlist viewer", async () => {
    const user = userEvent.setup();
    const shift = {
      _id: "shift-1",
      shift_name: "Dinner Service",
      shift_start: 1760000000000,
      shift_end: 1760003600000,
      volunteers: [],
      required_volunteer_count: 2,
    };
    const viewWaitlist = jest.fn();

    render(
      <ServiceShiftDetails
        shift={shift}
        view={jest.fn()}
        viewWaitlist={viewWaitlist}
        waitlistCount={3}
        waitlistStatus="ready"
        edit={jest.fn()}
        cancel={jest.fn()}
      />,
    );

    const waitlistButton = screen.getByRole("button", {
      name: "View waitlist for Dinner Service",
    });
    expect(waitlistButton).toHaveTextContent("Waitlist 3");

    await user.click(waitlistButton);
    expect(viewWaitlist).toHaveBeenCalledWith(shift);
  });
});
