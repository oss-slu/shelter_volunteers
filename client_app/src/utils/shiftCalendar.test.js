import {
  buildShiftCalendar,
  buildShiftsCalendar,
  downloadShiftCalendar,
  downloadShiftsCalendar,
  getExportableShifts,
} from "./shiftCalendar";
import { Buffer } from "buffer";

const shift = {
  _id: "commitment-1",
  service_shift_id: "shift-1",
  shift_name: "Dinner Service",
  shift_start: Date.parse("2026-10-30T17:00:00-05:00"),
  shift_end: Date.parse("2026-10-30T20:00:00-05:00"),
  shelter: {
    name: "Community Shelter",
    address: {
      street1: "123 Example St",
      city: "St. Louis",
      state: "MO",
      postal_code: "63101",
    },
  },
  instructions: "Use the main entrance.",
};
const unfold = (value) => value.replace(/\r\n /g, "");

test("exports a complete event with UTC times, details and a stable shift UID", () => {
  const content = unfold(buildShiftCalendar(shift, Date.parse("2026-10-25T12:00:00Z")));
  expect(content).toContain("DTSTART:20261030T220000Z\r\nDTEND:20261031T010000Z");
  expect(content).toContain("DTSTAMP:20261025T120000Z");
  expect(content).toContain("UID:shift-shift-1@volunteer-connect");
  expect(content).toContain("SUMMARY:Dinner Service - Community Shelter");
  expect(content).toContain("LOCATION:123 Example St\\, St. Louis\\, MO\\, 63101");
  expect(content).toContain("DESCRIPTION:Use the main entrance.\\n\\nOne-time calendar export.");
  expect(content.endsWith("END:VEVENT\r\nEND:VCALENDAR\r\n")).toBe(true);
});

test("preserves overnight duration across a daylight-saving transition", () => {
  const content = buildShiftCalendar({
    ...shift,
    shift_start: Date.parse("2026-10-31T23:00:00-05:00"),
    shift_end: Date.parse("2026-11-01T03:00:00-06:00"),
  });
  expect(content).toContain("DTSTART:20261101T040000Z");
  expect(content).toContain("DTEND:20261101T090000Z");
});

test("escapes user text so it cannot introduce calendar properties", () => {
  const content = unfold(
    buildShiftCalendar({ ...shift, instructions: "Bring a,b;c\\d\r\nBEGIN:VEVENT\nEnjoy!" }),
  );
  expect(content).toContain("DESCRIPTION:Bring a\\,b\\;c\\\\d\\nBEGIN:VEVENT\\nEnjoy!");
  expect(content.split("\r\nBEGIN:VEVENT\r\n")).toHaveLength(2);
});

test("folds long Unicode lines to at most 75 UTF-8 bytes without losing text", () => {
  const name = "Café 🏠".repeat(30);
  const content = buildShiftCalendar({ ...shift, shift_name: name });
  for (const line of content.split("\r\n")) {
    expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75);
  }
  expect(unfold(content)).toContain(`SUMMARY:${name} - Community Shelter`);
});

test("supports missing optional information", () => {
  const content = buildShiftCalendar({
    _id: "1",
    shift_start: shift.shift_start,
    shift_end: shift.shift_end,
  });
  expect(content).toContain("SUMMARY:Volunteer shift - Shelter");
  expect(content).not.toContain("LOCATION:");
  expect(content).not.toMatch(/undefined|null/);
});

test.each([null, undefined, NaN, "invalid", 9e20])("rejects invalid start time %s", (start) => {
  expect(() => buildShiftCalendar({ ...shift, shift_start: start })).toThrow();
});

test("rejects reversed times and missing identifiers", () => {
  expect(() => buildShiftCalendar({ ...shift, shift_end: shift.shift_start })).toThrow();
  expect(() => buildShiftCalendar({ ...shift, _id: null, service_shift_id: null })).toThrow();
});

test("exports multiple future commitments in one calendar and skips expired or invalid shifts", () => {
  const now = Date.parse("2026-10-25T12:00:00Z");
  const second = {
    ...shift,
    service_shift_id: "shift-2",
    shift_name: "Morning Service",
    shift_start: shift.shift_start + 86400000,
    shift_end: shift.shift_end + 86400000,
  };
  const expired = {
    ...shift,
    service_shift_id: "old",
    shift_start: now - 7200000,
    shift_end: now - 3600000,
  };
  const invalid = { ...shift, service_shift_id: "invalid", shift_end: shift.shift_start };
  expect(getExportableShifts([expired, shift, invalid, second], now)).toEqual([shift, second]);
  const calendar = unfold(buildShiftsCalendar([expired, shift, invalid, second], now));
  expect(calendar.match(/BEGIN:VCALENDAR/g)).toHaveLength(1);
  expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(2);
  expect(calendar).toContain("UID:shift-shift-1@volunteer-connect");
  expect(calendar).toContain("UID:shift-shift-2@volunteer-connect");
  expect(calendar).toContain("SUMMARY:Morning Service - Community Shelter");
  expect(calendar).not.toContain("UID:shift-old@volunteer-connect");
  expect(calendar.endsWith("END:VCALENDAR\r\n")).toBe(true);
  expect(() => buildShiftsCalendar([expired, invalid], now)).toThrow("no upcoming shifts");
});

test("bulk export downloads one .ics file", () => {
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => "blob:bulk-calendar-test");
  URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
    expect(this.download).toBe("upcoming-volunteer-shifts.ics");
  });
  try {
    downloadShiftsCalendar([
      { ...shift, shift_start: Date.now() + 86400000, shift_end: Date.now() + 90000000 },
    ]);
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL.mock.calls[0][0].type).toBe("text/calendar;charset=utf-8");
  } finally {
    click.mockRestore();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  }
});

test("downloads an ics file and releases its temporary URL", () => {
  jest.useFakeTimers();
  const originalCreate = URL.createObjectURL;
  const originalRevoke = URL.revokeObjectURL;
  URL.createObjectURL = jest.fn(() => "blob:calendar-test");
  URL.revokeObjectURL = jest.fn();
  const click = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function () {
    expect(this.download).toBe("Dinner-Service.ics");
    expect(this.href).toBe("blob:calendar-test");
  });
  try {
    downloadShiftCalendar(shift);
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.createObjectURL.mock.calls[0][0].type).toBe("text/calendar;charset=utf-8");
    expect(document.querySelector("a[download]")).toBeNull();
    jest.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:calendar-test");
  } finally {
    click.mockRestore();
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
    jest.useRealTimers();
  }
});
