import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";
import { useCurrentDashboard, useSidebar } from "../contexts/DashboardContext";

jest.mock("../contexts/DashboardContext", () => ({
  useCurrentDashboard: jest.fn(),
  useSidebar: jest.fn(),
  useDashboards: jest.fn(() => ({ dashboards: [] })),
}));

const user = { name: "Sam Rivera", email: "sam@example.org", picture: "" };

function renderHeader({ dashboard = null, sidebarOpen = true } = {}) {
  useCurrentDashboard.mockReturnValue({ currentDashboard: dashboard, onSelectDashboard: jest.fn() });
  useSidebar.mockReturnValue({ isSidebarOpen: sidebarOpen, setIsSidebarOpen: jest.fn() });
  render(
    <MemoryRouter initialEntries={["/volunteer-dashboard/impact"]}>
      <Header user={user} />
    </MemoryRouter>,
  );
}

const logo = () => screen.getByRole("link", { name: /volunteer connect/i });

describe("Header logo", () => {
  it("links to the current dashboard's home", () => {
    renderHeader({
      dashboard: { type: "volunteer", id: "volunteer-dashboard", name: "Volunteer Dashboard", path: "/volunteer-dashboard" },
    });
    expect(logo()).toHaveAttribute("href", "/volunteer-dashboard");
  });

  it("links to a shelter dashboard's home", () => {
    renderHeader({
      dashboard: { type: "shelter", id: "abc123", name: "Gateway Harbor Shelter", path: "/shelter-dashboard/abc123" },
    });
    expect(logo()).toHaveAttribute("href", "/shelter-dashboard/abc123");
  });

  it("falls back to the dashboard picker when no dashboard is selected", () => {
    renderHeader({ dashboard: null });
    expect(logo()).toHaveAttribute("href", "/");
  });

  it("is shown whether the sidebar is open or collapsed", () => {
    renderHeader({ sidebarOpen: false });
    expect(logo()).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /expand navigation/i })).toBeInTheDocument();
  });
});

describe("Header user menu", () => {
  it("shows initials when the user has no picture, and opens the menu", () => {
    renderHeader();
    expect(screen.getByText("SR")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /sam rivera/i }));
    expect(screen.getByText("sam@example.org")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /logout/i })).toBeInTheDocument();
  });
});
