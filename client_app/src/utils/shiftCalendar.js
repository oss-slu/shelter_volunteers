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

export function buildShiftCalendar(shift, now = Date.now()) {
  const id = shift?.service_shift_id || shift?._id;
  if (!hasValidShiftTimes(shift) || !id) {
    throw new Error("This shift has missing or invalid details and cannot be exported.");
  }
  const shelterName = shift.shelter?.name || "Shelter";
  const address = shift.shelter?.address;
  const location =
    typeof address === "string"
      ? address
      : [address?.street1, address?.street2, address?.city, address?.state, address?.postal_code]
          .filter(Boolean)
          .join(", ");
  const description = [shift.instructions, CALENDAR_EXPORT_NOTICE].filter(Boolean).join("\n\n");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Volunteer Connect//Shift Export//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:shift-${encodeURIComponent(String(id))}@volunteer-connect`,
    `DTSTAMP:${utcTimestamp(now)}`,
    `DTSTART:${utcTimestamp(shift.shift_start)}`,
    `DTEND:${utcTimestamp(shift.shift_end)}`,
    `SUMMARY:${escapeText(`${shift.shift_name || "Volunteer shift"} - ${shelterName}`)}`,
    ...(location ? [`LOCATION:${escapeText(location)}`] : []),
    `DESCRIPTION:${escapeText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function downloadShiftCalendar(shift) {
  const calendar = buildShiftCalendar(shift);
  const blob = new Blob([calendar], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const name = (shift.shift_name || "volunteer-shift").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60);
  link.href = url;
  link.download = `${name}.ics`;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Allow the browser to begin reading the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
