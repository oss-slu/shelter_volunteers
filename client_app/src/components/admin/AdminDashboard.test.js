import { fireEvent, render, screen } from "@testing-library/react";
import AdminDashboard from "./AdminDashboard";

jest.mock("./ShelterList", () => () => <div>All shelters content</div>);
jest.mock("./AddShelterForm", () => () => <div>Add shelter content</div>);
jest.mock("./OpenSheltersByDate", () => () => <div>Open shelters content</div>);

describe("AdminDashboard", () => {
  test("shows all shelters by default and orders the controls", () => {
    render(<AdminDashboard />);

    const controls = screen.getAllByRole("button");
    expect(controls.map((control) => control.textContent)).toEqual([
      "View All Shelters",
      "Add New Shelter",
      "Open Shelters by Date",
    ]);
    expect(controls[0]).toHaveClass("active");
    expect(controls[0]).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("All shelters content")).toBeInTheDocument();
  });

  test("switches between the existing shelter views", () => {
    render(<AdminDashboard />);

    fireEvent.click(screen.getByRole("button", { name: "Add New Shelter" }));
    expect(screen.getByText("Add shelter content")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add New Shelter" })).toHaveClass("active");

    fireEvent.click(screen.getByRole("button", { name: "Open Shelters by Date" }));
    expect(screen.getByText("Open shelters content")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View All Shelters" }));
    expect(screen.getByText("All shelters content")).toBeInTheDocument();
  });
});
