import { render, screen, waitFor } from "@testing-library/react";
import VolunteerDashboard from "../components/volunteer/VolunteerDashboard";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";

function renderWithRouter(children, routes = []) {
  const options = isValidElement(children) ? { element: children, path: "/" } : children;

  const router = createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: [options.path],
    initialIndex: 1,
  });

  return render(<RouterProvider router={router} />);
}

jest.mock("../components/volunteer/Shifts", () => ({
  UpcomingShifts: () => {
    return <div>Upcoming Shifts List...</div>;
  },
}));

test("three shelter cards are loaded", async() => {
  renderWithRouter(<VolunteerDashboard/>, 
    [{
      path: "/shelters",
      element: <h2>Shelter List Page</h2>,
    },])

    await waitFor(() => expect(screen.getAllByText("miles away", {exact: false})).toHaveLength(3), {
      timeout: 6000,
    }); //only 3 shift cards are rendered (they should all say the amt of miles away the shelter is)
    expect(screen.queryAllByTestId("add-button")).toHaveLength(0) //shelter cards shouldn't have add button and time
}, 10000)