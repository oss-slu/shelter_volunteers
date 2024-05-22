import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import ShiftList from "./../components/volunteer/ShiftList";

let mockShift = {
  code: 92341,
  shelter: 9321,
  start_time: 1696255200000,
  end_time: 1696269600000,
};
let mockShift2 = {
  code: 48593,
  shelter: 8323,
  start_time: 4696255200000,
  end_time: 5696255200000,
};
const onShiftClose = jest.fn(); //mock close function

test("shift list properly displays messaged when no shifts are selected", () => {
  render(<ShiftList shifts={[]} currentSelectionSection={true} onClose={onShiftClose} />);
  expect(screen.getByText("Please add your desired shifts from the list")).toBeInTheDocument();
});

test("shift list properly displays shifts when added", () => {
  render(
    <ShiftList
      shifts={[mockShift, mockShift2]}
      currentSelectionSection={true}
      onClose={onShiftClose}
    />,
  );
  const startTime = new Date(mockShift.start_time);
  const endTime = new Date(mockShift.end_time);
  const formattedStartTime = format(startTime, "M/dd/yy HH:mm");
  const formattedEndTime = format(endTime, "M/dd/yy HH:mm");
  expect(screen.getByText(mockShift.shelter)).toBeInTheDocument();
  expect(screen.getByText(formattedStartTime + " to " + formattedEndTime)).toBeInTheDocument();
  const startTime2 = new Date(mockShift2.start_time);
  const endTime2 = new Date(mockShift2.end_time);
  const formattedStartTime2 = format(startTime2, "M/dd/yy HH:mm");
  const formattedEndTime2 = format(endTime2, "M/dd/yy HH:mm");
  expect(screen.getByText(mockShift2.shelter)).toBeInTheDocument();
  expect(screen.getByText(formattedStartTime2 + " to " + formattedEndTime2)).toBeInTheDocument();
});
