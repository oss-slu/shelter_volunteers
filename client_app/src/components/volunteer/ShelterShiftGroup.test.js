import { render, screen, fireEvent } from "@testing-library/react";
import { ShelterShiftGroup, groupShiftsByShelter } from "./ShelterShiftGroup";

const HOUR = 3600000;
const base = new Date(2026, 10, 9, 0, 0, 0).getTime();
const shift = (id, shelterId, startHour, volunteers = 0) => ({
  _id: id,
  shelter_id: shelterId,
  shift_start: base + startHour * HOUR,
  shift_end: base + (startHour + 4) * HOUR,
  volunteer_count: volunteers,
  required_volunteer_count: 4,
  max_volunteer_count: 6,
  can_sign_up: true,
});
const shelterMap = {
  a: { _id: "a", name: "Zeta Shelter", address: { street1: "1 Main St", city: "St. Louis", state: "MO", postal_code: "63101" } },
  b: { _id: "b", name: "Alpha Haven", address: { street1: "2 Oak St", city: "St. Louis", state: "MO", postal_code: "63104" } },
};
const needOf = (s) => 1 - s.volunteer_count / s.required_volunteer_count;

describe("groupShiftsByShelter", () => {
  const shifts = [
    shift("a1", "a", 30, 3), // Zeta, later, low need
    shift("b1", "b", 40, 0), // Alpha, latest, high need
    shift("a2", "a", 8, 3), // Zeta, earliest
    shift("b2", "b", 20, 2),
  ];

  it("puts each shelter's shifts together, in time order", () => {
    const groups = groupShiftsByShelter(shifts, shelterMap, "date", needOf);
    expect(groups.map((g) => g.shelterId)).toEqual(["a", "b"]);
    expect(groups[0].shifts.map((s) => s._id)).toEqual(["a2", "a1"]);
    expect(groups[1].shifts.map((s) => s._id)).toEqual(["b2", "b1"]);
  });

  it("orders shelters by name", () => {
    const groups = groupShiftsByShelter(shifts, shelterMap, "shelter", needOf);
    expect(groups.map((g) => g.name)).toEqual(["Alpha Haven", "Zeta Shelter"]);
  });

  it("orders shelters and their shifts by greatest need", () => {
    const groups = groupShiftsByShelter(shifts, shelterMap, "need", needOf);
    expect(groups[0].shelterId).toBe("b");
    expect(groups[0].shifts.map((s) => s._id)).toEqual(["b1", "b2"]);
  });

  it("returns no groups for no shifts", () => {
    expect(groupShiftsByShelter([], shelterMap, "date", needOf)).toEqual([]);
  });
});

describe("ShelterShiftGroup", () => {
  const data = (overrides) => ({
    shift: shift("s1", "a", 8),
    startDate: "Nov 09, 2026",
    startTime: "08:00 AM",
    endTime: "12:00 PM",
    duration: 4,
    priority: "High",
    isSelected: false,
    signedUp: false,
    hasConflict: false,
    isFull: false,
    waitlisted: false,
    canJoinWaitlist: false,
    waitlistBusy: false,
    canInteract: true,
    hasInstructions: false,
    instructions: "",
    ...overrides,
  });

  function renderGroup(shiftsData, handlers = {}) {
    const props = {
      shelter: shelterMap.a,
      shiftsData,
      onToggle: jest.fn(),
      onWaitlistToggle: jest.fn(),
      expandedInstructions: new Set(),
      onInstructionsToggle: jest.fn(),
      ...handlers,
    };
    render(<ShelterShiftGroup {...props} />);
    return props;
  }

  it("shows the shelter once with its shift count", () => {
    renderGroup([data(), data({ shift: shift("s2", "a", 14) })]);
    expect(screen.getByRole("heading", { name: "Zeta Shelter" })).toBeInTheDocument();
    expect(screen.getByText("2 upcoming shifts")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });

  it("toggles a shift when its checkbox is clicked", () => {
    const { onToggle } = renderGroup([data()]);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalledWith(expect.objectContaining({ _id: "s1" }));
  });

  it("toggles a shift when the row text is clicked", () => {
    const { onToggle } = renderGroup([data()]);
    fireEvent.click(screen.getByText(/Nov 09, 2026/));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("locks signed-up shifts and labels them", () => {
    const { onToggle } = renderGroup([data({ signedUp: true, canInteract: false })]);
    const box = screen.getByRole("checkbox");
    expect(box).toBeDisabled();
    expect(box).toBeChecked();
    expect(screen.getByText("Signed up")).toBeInTheDocument();
    fireEvent.click(box);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("offers the waitlist for a full shift without selecting it", () => {
    const { onToggle, onWaitlistToggle } = renderGroup([
      data({ isFull: true, canInteract: false, canJoinWaitlist: true }),
    ]);
    fireEvent.click(screen.getByRole("button", { name: /join waitlist/i }));
    expect(onWaitlistToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("counts selected shifts in the header", () => {
    renderGroup([data({ isSelected: true }), data({ shift: shift("s2", "a", 14) })]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();
  });
});
