import { render, screen, waitFor } from "@testing-library/react";
import VolunteerDashboard from "../components/volunteer/VolunteerDashboard";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { userEvent } from "@testing-library/user-event";

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

jest.mock("../components/volunteer/ShelterList", () => {
  return {
    __esModule: true,
    default: () => {
      return <div>shelters</div>;
    },
  };
});

describe("tests that do not need shelters rendered", () => {
  beforeEach(async () => {
    renderWithRouter(<VolunteerDashboard />, 
    [{
      path: "/volunteer-dashboard/shelters",
      element: <h2>Shelter List Page</h2>,
    },])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })
  
  test("properly renders shelters header", async () => {
    expect(await screen.findByText("Shelters looking for Volunteers")).toBeInTheDocument()
  })
  
  test("properly renders impact header and cards", async () => {
    expect(await screen.findByText("Impact Created")).toBeInTheDocument()
    expect(await screen.findByText("Total hours served")).toBeInTheDocument()
    expect(await screen.findByText("Lives Touched")).toBeInTheDocument()
    expect(await screen.findByText("Shelters served")).toBeInTheDocument()
    const impactColumn = screen.getByText("Impact Created").innerHTML
    expect(impactColumn.includes("Total hours served"))
    expect(impactColumn.includes("Shelters served"))
    expect(impactColumn.includes("Total hours served"))
  })
  
  test("Sign up button navigates the shelters sign up page", async () => {
    const signUpButton = await screen.findByRole("button", { name: "Sign up for shifts"})
    expect(await screen.findByText("Sign up for shifts")).toBeInTheDocument()
    userEvent.click(signUpButton)
    await waitFor(() => {
      expect(screen.getByText("Shelter List Page")).toBeInTheDocument()
    })
  })
  
  test("Shelters List has button that navigates to the sign up page", async () => {
    expect(await screen.findByText("Shelters looking for Volunteers")).toBeInTheDocument()
    const viewAllButton = await screen.findByRole("button", { name: "View All Shelters"})
    expect(await screen.findByText("View All Shelters")).toBeInTheDocument()
    userEvent.click(viewAllButton)
    await waitFor(() => {
      expect(screen.getByText("Shelter List Page")).toBeInTheDocument()
    })
  })
  
  test("Upcoming shifts gets rendered", async () => {
    expect(await screen.findByText("Upcoming Shifts"))
    expect(await screen.findByText("Upcoming Shifts List..."))
  })
})
