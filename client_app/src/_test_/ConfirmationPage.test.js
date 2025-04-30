import ConfirmationPage from "../components/volunteer/ConfirmationPage";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { format } from "date-fns";

let mockShift = {
  code: 92341,
  shelter: 9321,
  start_time: 1696255200000,
  end_time: 1696269600000,
};
let formattedStartTime = format(mockShift.start_time, "MMM, dd, yyyy HH:mm aa");
let formattedEndTime = format(mockShift.end_time, "MMM, dd, yyyy HH:mm aa");

function renderWithRouter(children, routes = []) {
  const options = isValidElement(children) ? { element: children, path: "/" } : children;

  const router = createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: [options.path],
    initialIndex: 1,
  });

  return render(<RouterProvider router={router} />);
}

test("properly renders confirmation page with one successful shift", () => {
  renderWithRouter(<ConfirmationPage selectedShifts={[mockShift]} shiftStatusList={[{"success": true}]} />, [
    {
      path: "/",
      element: <h2>Dashboard</h2>,
    },
    {
      path: "/shelters",
      element: <h2>Shelter List Page</h2>,
    },
    {
      path: "/upcoming-shifts",
      element: <h2>Upcoming Shifts Page</h2>,
    },
  ]);
  expect(screen.getByText("9321")).toBeInTheDocument();
  expect(screen.getByText(formattedStartTime)).toBeInTheDocument();
  expect(screen.getByText(formattedEndTime)).toBeInTheDocument();
  expect(screen.getByText("Success")).toBeInTheDocument();
});

test("properly renders confirmation page with one failure shift", async () => {
  renderWithRouter(<ConfirmationPage selectedShifts={[mockShift]} shiftStatusList={[false]} />, [
    {
      path: "/",
      element: <h2>Dashboard</h2>,
    },
    {
      path: "/shelters",
      element: <h2>Shelter List Page</h2>,
    },
    {
      path: "/upcoming-shifts",
      element: <h2>Upcoming Shifts Page</h2>,
    },
  ]);
  expect(screen.getByText("9321")).toBeInTheDocument();
  expect(screen.getByText(formattedStartTime)).toBeInTheDocument();
  expect(screen.getByText(formattedEndTime)).toBeInTheDocument();
  expect(screen.getByText("Failure")).toBeInTheDocument();
  const failIcon = screen.getByLabelText(
    "You're already registered for another shift at this time",
  );
  expect(
    screen.queryByText("You're already registered for another shift at this time"),
  ).not.toBeInTheDocument();
  await userEvent.hover(failIcon);
  await waitFor(() => {
    expect(
      screen.getByText("You're already registered for another shift at this time"),
    ).toBeInTheDocument();
  });
});
