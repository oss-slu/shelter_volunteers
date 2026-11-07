import { render, screen, fireEvent, within } from "@testing-library/react";
import SignUpResults, { friendlyReason } from "./SignUpResults";
import { downloadShiftsCalendar, downloadShiftCalendar } from "../../utils/shiftCalendar";

jest.mock("../../utils/shiftCalendar", () => {
  const actual = jest.requireActual("../../utils/shiftCalendar");
  return { ...actual, downloadShiftsCalendar: jest.fn(), downloadShiftCalendar: jest.fn() };
});

const DAY = 86400000;
const shelter = (id, name) => ({
  _id: id,
  name,
  address: { street1: "200 Example Street", city: "St. Louis", state: "MO", postal_code: "63104" },
});
const shift = (id, shelterId, inDays, extra = {}) => {
  const start = Date.now() + inDays * DAY;
  return { _id: id, shelter_id: shelterId, shift_start: start, shift_end: start + 4 * 3600000, ...extra };
};
const ok = { success: true, service_commitment_id: "c1" };

function renderResults(items, extra = {}) {
  const props = { items, userName: "Sam Rivera", onClose: jest.fn(), onViewUpcoming: jest.fn(), ...extra };
  render(<SignUpResults {...props} />);
  return props;
}

beforeEach(() => jest.clearAllMocks());

it("thanks the volunteer and says the shelter still has to confirm", () => {
  renderResults([
    { shift: shift("s1", "a", 3, { instructions: "Use the side door." }), shelter: shelter("a", "Welcome Center"), result: ok },
  ]);
  const dialog = screen.getByRole("dialog", { name: /thanks, sam — you're signed up!/i });
  expect(within(dialog).getByText(/will review your sign-up and confirm your spot/i)).toBeInTheDocument();
  expect(within(dialog).getByText("Awaiting shelter confirmation")).toBeInTheDocument();
  expect(within(dialog).getByText("Welcome Center")).toBeInTheDocument();
  expect(within(dialog).getByText("Use the side door.")).toBeInTheDocument();
  expect(within(dialog).getByText(/200 Example Street, St\. Louis, MO 63104/)).toBeInTheDocument();
  // Never claims the spot is confirmed.
  expect(dialog.textContent).not.toMatch(/\bconfirmed\b/i);
});

it("offers Google Calendar and .ics for each shift", () => {
  const s = shift("s1", "a", 3);
  renderResults([{ shift: s, shelter: shelter("a", "Welcome Center"), result: ok }]);

  const google = screen.getByRole("link", { name: /google calendar/i });
  const url = new URL(google.getAttribute("href"));
  expect(url.hostname).toBe("calendar.google.com");
  expect(url.searchParams.get("text")).toContain("Welcome Center");
  expect(url.searchParams.get("dates")).toMatch(/^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/);
  expect(url.searchParams.get("location")).toContain("200 Example Street");

  fireEvent.click(screen.getByRole("button", { name: /apple \/ outlook/i }));
  expect(downloadShiftCalendar).toHaveBeenCalledWith(expect.objectContaining({ _id: "s1", shelter: expect.any(Object) }));
  expect(screen.queryByRole("button", { name: /add all to calendar/i })).not.toBeInTheDocument();
});

it("adds every shift at once when there are several", () => {
  renderResults([
    { shift: shift("s1", "a", 3), shelter: shelter("a", "Welcome Center"), result: ok },
    { shift: shift("s2", "b", 5), shelter: shelter("b", "River Shelter"), result: ok },
  ]);
  fireEvent.click(screen.getByRole("button", { name: /add all to calendar/i }));
  expect(downloadShiftsCalendar).toHaveBeenCalledTimes(1);
  expect(downloadShiftsCalendar.mock.calls[0][0].map((s) => s._id)).toEqual(["s1", "s2"]);
});

it("explains sign-ups that could not be submitted", () => {
  renderResults([
    { shift: shift("s1", "a", 3), shelter: shelter("a", "Welcome Center"), result: ok },
    { shift: shift("s2", "b", 3), shelter: shelter("b", "River Shelter"), result: { success: false, message: "Overlapping commitment" } },
  ]);
  expect(screen.getByRole("dialog", { name: /you signed up for 1 of 2 shifts/i })).toBeInTheDocument();
  const notSubmitted = screen.getByRole("region", { name: /sign-ups not submitted/i });
  expect(within(notSubmitted).getByText("River Shelter")).toBeInTheDocument();
  expect(within(notSubmitted).getByText(/overlaps with another shift/i)).toBeInTheDocument();
});

it("handles every sign-up failing", () => {
  const { onViewUpcoming } = renderResults([
    { shift: shift("s1", "a", 3), shelter: shelter("a", "Welcome Center"), result: { success: false, message: "Shift is full. Join the waitlist instead." } },
  ]);
  expect(screen.getByRole("dialog", { name: /we couldn't sign you up/i })).toBeInTheDocument();
  expect(screen.getByText(/join its waitlist/i)).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /google calendar/i })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /view my shifts/i })).not.toBeInTheDocument();
  expect(onViewUpcoming).not.toHaveBeenCalled();
});

it("closes with Done, the close button, or Escape, and links to the volunteer's shifts", () => {
  const props = renderResults([{ shift: shift("s1", "a", 3), shelter: shelter("a", "Welcome Center"), result: ok }]);
  expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();

  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  fireEvent.keyDown(document, { key: "Escape" });
  expect(props.onClose).toHaveBeenCalledTimes(3);

  fireEvent.click(screen.getByRole("button", { name: /view my shifts/i }));
  expect(props.onViewUpcoming).toHaveBeenCalledTimes(1);
});

describe("friendlyReason", () => {
  it.each([
    ["Overlapping commitment", /overlaps/],
    ["Shift is full. Join the waitlist instead.", /waitlist/],
    ["cannot commit to non-existing shift x", /no longer available/],
    ["Something else", /Something else/],
    [undefined, /try again/],
  ])("%p", (message, expected) => {
    expect(friendlyReason(message)).toMatch(expected);
  });
});
