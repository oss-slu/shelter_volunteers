import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { waitlistAPI } from "../../api/waitlist";
import ShiftWaitlistModal from "./ShiftWaitlistModal";

jest.mock("../../api/waitlist", () => ({
  waitlistAPI: {
    getForShift: jest.fn(),
  },
}));

const shift = {
  _id: "shift-1",
  shift_name: "Dinner Service",
};

describe("ShiftWaitlistModal", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleError.mockRestore();
  });

  it("displays volunteers in queue order", async () => {
    waitlistAPI.getForShift.mockResolvedValue([
      {
        _id: "entry-1",
        volunteer_id: "first@example.com",
        joined_at: 1760000000000,
        position: 1,
      },
      {
        _id: "entry-2",
        volunteer_id: "second@example.com",
        joined_at: 1760000100000,
        position: 2,
      },
    ]);

    render(<ShiftWaitlistModal isOpen onClose={jest.fn()} shelterId="shelter-1" shift={shift} />);

    expect(await screen.findByText("first@example.com")).toBeInTheDocument();
    expect(screen.getByText("second@example.com")).toBeInTheDocument();
    expect(screen.getByText("2 waiting")).toBeInTheDocument();
    expect(waitlistAPI.getForShift).toHaveBeenCalledWith("shelter-1", "shift-1");
  });

  it("shows a helpful empty state", async () => {
    waitlistAPI.getForShift.mockResolvedValue([]);

    render(<ShiftWaitlistModal isOpen onClose={jest.fn()} shelterId="shelter-1" shift={shift} />);

    expect(await screen.findByText("No volunteers are waiting")).toBeInTheDocument();
    expect(screen.getByText("0 waiting")).toBeInTheDocument();
  });

  it("shows an error and retries the request", async () => {
    const user = userEvent.setup();
    waitlistAPI.getForShift
      .mockRejectedValueOnce(new Error("Could not load waitlist"))
      .mockResolvedValueOnce([
        {
          _id: "entry-1",
          volunteer_id: "retry@example.com",
          joined_at: 1760000000000,
          position: 1,
        },
      ]);

    render(<ShiftWaitlistModal isOpen onClose={jest.fn()} shelterId="shelter-1" shift={shift} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load waitlist");
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("retry@example.com")).toBeInTheDocument();
    expect(waitlistAPI.getForShift).toHaveBeenCalledTimes(2);
  });
});
