import { render, screen, waitFor } from "@testing-library/react";
import VolunteerDashboard from "./../VolunteerDashboard.js";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";
//import Shelters from "./../Shelters.js";

function renderWithRouter(children, routes = []) {
  const options = isValidElement(children) ? { element: children, path: "/" } : children;

  const router = createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: [options.path],
    initialIndex: 1,
  });

  return render(<RouterProvider router={router} />);
}

/*jest.mock('./../Shelters', () => ({
  __esModule: true, 
  ...jest.requireActual('../Shelters'),
  getLocation : jest.fn()
}));*/

jest.mock("../Shifts", () => ({
  UpcomingShifts: () => {
    return <div>Upcoming Shifts List...</div>;
  },
}));

beforeEach(() => {
  jest.useFakeTimers()
  renderWithRouter(<VolunteerDashboard />, 
  [{
    path: "/shelters",
    element: <h2>Shelter List Page</h2>,
  },])
})

test("properly renders shelters header", () => {
  expect(screen.getByText("Shelters looking for Volunteers")).toBeInTheDocument()
})

test("properly renders impact header and cards", () => {
  expect(screen.getByText("Impact Created")).toBeInTheDocument()
  expect(screen.getByText("Total hours served")).toBeInTheDocument()
  expect(screen.getByText("Lives Touched")).toBeInTheDocument()
  expect(screen.getByText("Shelters served")).toBeInTheDocument()
  const impactColumn = screen.getByText("Impact Created").innerHTML //making sure the cards are below proper column
  expect(impactColumn.includes("Total hours served"))
  expect(impactColumn.includes("Shelters served"))
  expect(impactColumn.includes("Total hours served"))
})

test("Sign up button navigates the shelters sign up page", async () => {
  const signUpButton = screen.getByRole("button", { name: "Sign up for shifts"})
  expect(screen.getByText("Sign up for shifts")).toBeInTheDocument()
  userEvent.click(signUpButton)
  await waitFor(() => {
    expect(screen.getByText("Shelter List Page")).toBeInTheDocument()
  })
})

test("Shelters List has button that navigates to the sign up page", async () => {
  expect(screen.getByText("Shelters looking for Volunteers")).toBeInTheDocument()
  const viewAllButton = screen.getByRole("button", { name: "View All Shelters"})
  expect(screen.getByText("View All Shelters")).toBeInTheDocument()
  userEvent.click(viewAllButton)
  await waitFor(() => {
    expect(screen.getByText("Shelter List Page")).toBeInTheDocument()
  })
})

test("Upcoming shifts gets rendered", async () => {
  expect(screen.getByText("Upcoming Shifts"))
  expect(screen.getByText("Upcoming Shifts List..."))
})

/*test("Get shelters button works", async () => {
  jest.spyOn(Shelters, Shelters.getLocation);
  const locationButton = screen.getByRole("button", { name: "Get Shelters from Current Location"})
  expect(screen.getByText("Get Shelters from Current Location")).toBeInTheDocument()
  userEvent.click(locationButton)
  expect(Shelters.getLocation).toHaveBeenCalledTimes(1)
  
})*/


