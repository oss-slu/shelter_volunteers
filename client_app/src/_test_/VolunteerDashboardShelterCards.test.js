import { render, screen, waitFor } from "@testing-library/react";
import VolunteerDashboard from "../components/volunteer/VolunteerDashboard";
import React, { isValidElement } from "react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import useShelterData from "../components/volunteer/hooks/useShelterData";
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

// mock shelter data response
const shelterData = {
  "totalElements": 3,
  "totalPages": 1,
  "pageable": {
    "pageNumber": 0,
    "pageSize": 3,
    "sort": {
      "unsorted": true,
      "sorted": false,
      "empty": true
    },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "numberOfElements": 138,
  "first": true,
  "last": true,
  "size": 1000,
  "content": [
    {
      "id": 111,
      "facilityType": "shelter",
      "status": 0,
      "name": "test shelter 1",
      "organizationId": null,
      "phone": "(620) 221-9664",
      "website": null,
      "city": "Winfield",
      "state": "KS",
      "county": "Cowley",
      "country": "usa",
      "zipCode": "67156",
      "latitude": 37.16481,
      "longitude": -97.026717,
      "privateAddress": false,
      "beds": 0,
      "baths": null,
      "favorite": null,
      "accreditations": [],
      "images": [],
      "distance": 11.4821168240232,
      "residentServed": "POP_UNDER_18,POP_18_65,POP_FEMALE_ONLY,POP_MALE_ONLY",
      "genderType": null,
      "acceptsInsurance": true,
      "avgCostMinimum": null,
      "depositAmount": null,
      "rentPaidWeekly": null,
      "moudMedications": null,
      "smokingPolicy": "PT_TOBACCO_ALLOWED_DESIGNATED",
      "bedUpdatedAt": null,
      "structureType": null,
      "volunteerNeeded": false,
      "volunteerCapacity": null,
      "volunteerCount": null
    },
    {
      "id": 222,
      "facilityType": "shelter",
      "status": 0,
      "name": "test shelter 2",
      "organizationId": null,
      "phone": "(620) 221-9664",
      "website": null,
      "city": "Winfield",
      "state": "KS",
      "county": "Cowley",
      "country": "usa",
      "zipCode": "67156",
      "latitude": 37.16481,
      "longitude": -97.026717,
      "privateAddress": false,
      "beds": 0,
      "baths": null,
      "favorite": null,
      "accreditations": [],
      "images": [],
      "distance": 11.4821168240232,
      "residentServed": "POP_UNDER_18,POP_18_65,POP_FEMALE_ONLY,POP_MALE_ONLY",
      "genderType": null,
      "acceptsInsurance": true,
      "avgCostMinimum": null,
      "depositAmount": null,
      "rentPaidWeekly": null,
      "moudMedications": null,
      "smokingPolicy": "PT_TOBACCO_ALLOWED_DESIGNATED",
      "bedUpdatedAt": null,
      "structureType": null,
      "volunteerNeeded": false,
      "volunteerCapacity": null,
      "volunteerCount": null
    },
    {
      "id": 333,
      "facilityType": "shelter",
      "status": 0,
      "name": "test shelter 3",
      "organizationId": null,
      "phone": "(620) 221-9664",
      "website": null,
      "city": "Winfield",
      "state": "KS",
      "county": "Cowley",
      "country": "usa",
      "zipCode": "67156",
      "latitude": 37.16481,
      "longitude": -97.026717,
      "privateAddress": false,
      "beds": 0,
      "baths": null,
      "favorite": null,
      "accreditations": [],
      "images": [],
      "distance": 11.4821168240232,
      "residentServed": "POP_UNDER_18,POP_18_65,POP_FEMALE_ONLY,POP_MALE_ONLY",
      "genderType": null,
      "acceptsInsurance": true,
      "avgCostMinimum": null,
      "depositAmount": null,
      "rentPaidWeekly": null,
      "moudMedications": null,
      "smokingPolicy": "PT_TOBACCO_ALLOWED_DESIGNATED",
      "bedUpdatedAt": null,
      "structureType": null,
      "volunteerNeeded": false,
      "volunteerCapacity": null,
      "volunteerCount": null
    },
    {
      "id": 333,
      "facilityType": "shelter",
      "status": 0,
      "name": "test shelter 4",
      "organizationId": null,
      "phone": "(620) 221-9664",
      "website": null,
      "city": "Winfield",
      "state": "KS",
      "county": "Cowley",
      "country": "usa",
      "zipCode": "67156",
      "latitude": 37.16481,
      "longitude": -97.026717,
      "privateAddress": false,
      "beds": 0,
      "baths": null,
      "favorite": null,
      "accreditations": [],
      "images": [],
      "distance": 11.4821168240232,
      "residentServed": "POP_UNDER_18,POP_18_65,POP_FEMALE_ONLY,POP_MALE_ONLY",
      "genderType": null,
      "acceptsInsurance": true,
      "avgCostMinimum": null,
      "depositAmount": null,
      "rentPaidWeekly": null,
      "moudMedications": null,
      "smokingPolicy": "PT_TOBACCO_ALLOWED_DESIGNATED",
      "bedUpdatedAt": null,
      "structureType": null,
      "volunteerNeeded": false,
      "volunteerCapacity": null,
      "volunteerCount": null
    },
  ]
};

const defaultMockShelterData = {
  data: shelterData,
  setData: jest.fn(),
  originalData: shelterData,
  loading: false,
  setLoading: jest.fn(),
  noSearchDataAvailable: false,
  setNoSearchDataAvailable: jest.fn(),
  getLocation: jest.fn(),
  setRadiusfromLocation: jest.fn()
};

jest.mock('../components/volunteer/hooks/useShelterData', () => ({
  useShelterData() {
    return {
      data: shelterData,
      setData: jest.fn(),
      originalData: shelterData.content,
      loading: false,
      setLoading: jest.fn(),
      noSearchDataAvailable: false,
      setNoSearchDataAvailable: jest.fn(),
      getLocation: jest.fn(),
      setRadiusfromLocation: jest.fn()
    };
  },
}));

describe('Shelters', () => {

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("three shelter cards are loaded", async () => {
    renderWithRouter(<VolunteerDashboard />, 
      [{
        path: "/shelters",
        element: <h2>Shelter List Page</h2>,
      }]
    );

    expect(screen.getAllByText("miles away", { exact: false })).toHaveLength(3); //only 3 shift cards are rendered (they should all say the amt of miles away the shelter is)
    expect(screen.queryAllByTestId("add-button")).toHaveLength(0); //shelter cards shouldn't have add button and time
  });
});