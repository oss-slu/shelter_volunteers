// RFC 5545 text escaping and UTF-8 content-line folding.
const escapeText = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const foldLine = (line) => {
  let folded = "";
  let bytes = 0;
  for (const character of line) {
    const point = character.codePointAt(0);
    const size = point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes + size > 75) {
      folded += "\r\n ";
      bytes = 1;
    }
    folded += character;
    bytes += size;
  }
  return folded;
};

const utcTimestamp = (timestamp) =>
  new Date(timestamp)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");

export const hasValidShiftTimes = (shift) =>
  Number.isFinite(shift?.shift_start) &&
  Number.isFinite(shift?.shift_end) &&
  !Number.isNaN(new Date(shift.shift_start).getTime()) &&
  !Number.isNaN(new Date(shift.shift_end).getTime()) &&
  shift.shift_end > shift.shift_start;

export const CALENDAR_EXPORT_NOTICE =
  "One-time calendar export. Shift changes or cancellations will not update your calendar automatically.";

const shiftLocation = (shift) => {
  const address = shift.shelter?.address;
  return typeof address === "string"
    ? address
    : [address?.street1, address?.street2, address?.city, address?.state, address?.postal_code]
        .filter(Boolean)
        .join(", ");
};

const shiftTitle = (shift) => `${shift.shift_name || "Volunteer shift"} - ${shift.shelter?.name || "Shelter"}`;

/** The VEVENT lines for one shift (unfolded). Throws on missing/invalid data. */
function shiftEventLines(shift, now) {
  const id = shift?.service_shift_id || shift?._id;
  if (!hasValidShiftTimes(shift) || !id) {
    throw new Error("This shift has missing or invalid details and cannot be exported.");
  }
  const location = shiftLocation(shift);
  const description = [shift.instructions, CALENDAR_EXPORT_NOTICE].filter(Boolean).join("\n\n");
  return [
    "BEGIN:VEVENT",
    `UID:shift-${encodeURIComponent(String(id))}@volunteer-connect`,
    `DTSTAMP:${utcTimestamp(now)}`,
    `DTSTART:${utcTimestamp(shift.shift_start)}`,
    `DTEND:${utcTimestamp(shift.shift_end)}`,
    `SUMMARY:${escapeText(shiftTitle(shift))}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    "END:VEVENT",
  ];
}

/** An .ics calendar holding one event per shift. */
export function buildShiftsCalendar(shifts, now = Date.now()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Volunteer Connect//Shift Export//EN",
    "CALSCALE:GREGORIAN",
    ...shifts.flatMap((shift) => shiftEventLines(shift, now)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function buildShiftCalendar(shift, now = Date.now()) {
  return buildShiftsCalendar([shift], now);
}

/**
 * "Add to Google Calendar" link for a shift (opens a prefilled event; nothing
 * is sent until the volunteer saves it in Google Calendar).
 */
export function googleCalendarUrl(shift) {
  if (!hasValidShiftTimes(shift)) {
    throw new Error("This shift has missing or invalid details and cannot be exported.");
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: shiftTitle(shift),
    dates: `${utcTimestamp(shift.shift_start)}/${utcTimestamp(shift.shift_end)}`,
    details: [shift.instructions, CALENDAR_EXPORT_NOTICE].filter(Boolean).join("\n\n"),
  });
  const location = shiftLocation(shift);
  if (location) params.set("location", location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function downloadCalendarFile(calendar, baseName) {
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${baseName.replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60)}.ics`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow the browser to begin reading the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** Downloads one .ics file containing every given shift. */
export function downloadShiftsCalendar(shifts, baseName = "volunteer-shifts") {
  downloadCalendarFile(buildShiftsCalendar(shifts), baseName);
}

export function downloadShiftCalendar(shift) {
  downloadCalendarFile(buildShiftCalendar(shift), shift.shift_name || "volunteer-shift");
}
