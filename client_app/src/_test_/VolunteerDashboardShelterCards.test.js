import { render, screen } from "@testing-library/react";
import VolunteerDashboard from "../components/volunteer/VolunteerDashboard";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import { shelterData } from "./MockShelterData"; 

function renderWithRouter(children, routes = []) {
  const options = isValidElement(children) ? { element: children, path: "/" } : children;

  const router = createMemoryRouter([{ ...options }, ...routes], {
    initialEntries: [options.path],
    initialIndex: 1,
  });

  return render(<RouterProvider router={router} />);
}

const mockShelterData = shelterData;
jest.mock('../components/volunteer/hooks/useShelterData', () => ({
  useShelterData() {
    return {
      data: mockShelterData,
      setData: jest.fn(),
      originalData: mockShelterData.content,
      loading: false,
      setLoading: jest.fn(),
      noSearchDataAvailable: false,
      setNoSearchDataAvailable: jest.fn(),
      getLocation: jest.fn(),
      setRadiusfromLocation: jest.fn()
    };
  },
}));

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
});

jest.mock("../components/volunteer/Commitments", () => ({
  UpcomingCommitments: () => {
    return <div>Upcoming Commitments ...</div>;
  },
}));

test("three shelter cards are loaded", async() => {
  renderWithRouter(<VolunteerDashboard/>, 
    [{
      path: "/volunteer-dashboard/shelters",
      element: <h2>Shelter List Page</h2>,
    },]);

  expect(screen.queryAllByTestId("add-button")).toHaveLength(0); //shelter cards shouldn't have add button and time
});