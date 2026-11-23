import { render, screen, fireEvent } from "@testing-library/react";
import AddToCalendarButton from "./AddToCalendarButton";
import { DesktopShiftRow } from "./DesktopShiftRow";
import { MobileShiftCard } from "./MobileShiftCard";
import { downloadShiftCalendar } from "../../utils/shiftCalendar";

jest.mock("../../utils/shiftCalendar", () => ({
  ...jest.requireActual("../../utils/shiftCalendar"),
  downloadShiftCalendar: jest.fn(),
}));
jest.mock("./ShelterInfo", () => ({ ShelterInfo: () => <span>Community Shelter</span> }));

const shift = {
  _id: "1",
  shift_name: "Dinner",
  shift_start: Date.now() + 86400000,
  shift_end: Date.now() + 90000000,
};
const data = {
  shift,
  shelter: {},
  canInteract: true,
  startDate: "Tomorrow",
  startTime: "5 PM",
  endTime: "6 PM",
  duration: 1,
};
afterEach(() => jest.resetAllMocks());

test.each(["desktop", "mobile"])(
  "exports on %s without selecting the shift for cancellation",
  (layout) => {
    const toggle = jest.fn();
    render(
      layout === "desktop" ? (
        <table>
          <tbody>
            <DesktopShiftRow shiftData={data} handleShiftToggle={toggle} showCalendarExport />
          </tbody>
        </table>
      ) : (
        <MobileShiftCard shiftData={data} handleShiftToggle={toggle} showCalendarExport />
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Add Dinner to calendar" }));
    expect(downloadShiftCalendar).toHaveBeenCalledWith(shift);
    expect(toggle).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent("download started");
  },
);

test("does not offer exports on shared signup rows by default", () => {
  render(
    <table>
      <tbody>
        <DesktopShiftRow shiftData={data} handleShiftToggle={jest.fn()} />
      </tbody>
    </table>,
  );
  expect(screen.queryByRole("button", { name: /to calendar/ })).not.toBeInTheDocument();
});

test("shows a recoverable download error", () => {
  downloadShiftCalendar.mockImplementation(() => {
    throw new Error("Download unavailable");
  });
  render(<AddToCalendarButton shift={shift} />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not download");
  expect(screen.getByRole("button")).toBeEnabled();
});

test("disables downloads for invalid or past shifts", () => {
  const { rerender } = render(<AddToCalendarButton shift={{ ...shift, shift_start: null }} />);
  expect(screen.getByRole("button")).toBeDisabled();
  rerender(<AddToCalendarButton shift={{ ...shift, shift_start: 1000, shift_end: 2000 }} />);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(downloadShiftCalendar).not.toHaveBeenCalled();
});
