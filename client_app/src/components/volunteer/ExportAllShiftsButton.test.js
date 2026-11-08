import { fireEvent, render, screen } from "@testing-library/react";
import ExportAllShiftsButton from "./ExportAllShiftsButton";
import { downloadShiftsCalendar } from "../../utils/shiftCalendar";

jest.mock("../../utils/shiftCalendar", () => ({
  ...jest.requireActual("../../utils/shiftCalendar"),
  downloadShiftsCalendar: jest.fn(),
}));

const futureShift = {
  _id: "commitment-1",
  service_shift_id: "shift-1",
  shift_start: Date.now() + 86400000,
  shift_end: Date.now() + 90000000,
};

afterEach(() => jest.resetAllMocks());

test("downloads all supplied commitments with one click", () => {
  const shifts = [futureShift, { ...futureShift, _id: "commitment-2", service_shift_id: "shift-2" }];
  render(<ExportAllShiftsButton shifts={shifts} />);
  fireEvent.click(screen.getByRole("button", { name: "Export all upcoming shifts (2)" }));
  expect(downloadShiftsCalendar).toHaveBeenCalledTimes(1);
  expect(downloadShiftsCalendar).toHaveBeenCalledWith(shifts);
  expect(screen.getByRole("status")).toHaveTextContent("2 shifts");
});

test("disables export when no future shifts are available", () => {
  render(<ExportAllShiftsButton shifts={[]} />);
  expect(screen.getByRole("button", { name: "Export all upcoming shifts (0)" })).toBeDisabled();
  expect(screen.getByText(/No confirmed upcoming shifts/)).toBeInTheDocument();
});

test("shows an error if the download fails", () => {
  downloadShiftsCalendar.mockImplementation(() => { throw new Error("Download failed"); });
  render(<ExportAllShiftsButton shifts={[futureShift]} />);
  fireEvent.click(screen.getByRole("button", { name: "Export all upcoming shifts (1)" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Could not download");
});
