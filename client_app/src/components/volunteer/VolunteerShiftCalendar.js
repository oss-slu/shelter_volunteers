import { useMemo, useCallback, useState } from 'react';
import { Calendar, Views } from 'react-big-calendar';
import { dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { formatDate, formatTime } from '../../formatting/FormatDateTime';
import ShiftDetailsModal from './ShiftDetailsModal';
import '../../styles/volunteer/VolunteerShiftCalendar.css';

const localizer = dayjsLocalizer(dayjs);

/**
 * Builds calendar events from volunteer commitments (shifts).
 * Each event has start, end, title, and resource (shift + shelter).
 */
function shiftsToEvents(shifts) {
  if (!shifts || !Array.isArray(shifts)) return [];
  return shifts
    .filter((c) => c && c.shift_start != null && c.shift_end != null)
    .map((c) => {
      const start = new Date(c.shift_start);
      const end = new Date(c.shift_end);
      const shelterName = c.shelter?.name || 'Shelter';
      const timeStr = `${formatTime(c.shift_start)} – ${formatTime(c.shift_end)}`;
      return {
        id: c._id,
        title: `${shelterName} (${timeStr})`,
        start,
        end,
        resource: { shift: c, shelter: c.shelter },
      };
    })
    .filter((e) => e && e.title && e.start && e.end);
}

/**
 * Returns the number of shifts that fall on the given calendar day (local date).
 */
function getShiftCountForDay(shifts, date) {
  const dayStart = dayjs(date).startOf('day').valueOf();
  const dayEnd = dayjs(date).endOf('day').valueOf();
  return shifts.filter((c) => {
    const start = c.shift_start;
    return start >= dayStart && start <= dayEnd;
  }).length;
}

export default function VolunteerShiftCalendar({ shifts }) {
  const events = useMemo(() => shiftsToEvents(shifts || []), [shifts]);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsShifts, setDetailsShifts] = useState([]);
  const [detailsDateLabel, setDetailsDateLabel] = useState('');

  const handleSelectEvent = useCallback(
    (event) => {
      if (event.resource?.shift) {
        setDetailsShifts([event.resource.shift]);
        setDetailsDateLabel(formatDate(event.resource.shift.shift_start));
        setDetailsOpen(true);
      }
    },
    []
  );

  const handleSelectSlot = useCallback(
    (slotInfo) => {
      const dayStart = dayjs(slotInfo.start).startOf('day').valueOf();
      const dayEnd = dayjs(slotInfo.start).endOf('day').valueOf();
      const shiftsOnDay = (shifts || []).filter((c) => {
        const start = c.shift_start;
        return start >= dayStart && start <= dayEnd;
      });
      if (shiftsOnDay.length > 0) {
        setDetailsShifts(shiftsOnDay);
        setDetailsDateLabel(formatDate(slotInfo.start));
        setDetailsOpen(true);
      }
    },
    [shifts]
  );

  const dayPropGetter = useCallback(
    (date) => {
      const count = getShiftCountForDay(shifts || [], date);
      if (count === 0) return {};
      if (count === 1)
        return { className: 'volunteer-calendar-day-one-shift' };
      return { className: 'volunteer-calendar-day-multiple-shifts' };
    },
    [shifts]
  );

  const closeDetails = useCallback(() => {
    setDetailsOpen(false);
    setDetailsShifts([]);
    setDetailsDateLabel('');
  }, []);

  return (
    <div className="volunteer-shift-calendar-wrapper">
      <div className="volunteer-calendar-legend">
        <span className="legend-item">
          <span className="legend-dot legend-one" /> 1 shift
        </span>
        <span className="legend-item">
          <span className="legend-dot legend-multiple" /> 2+ shifts
        </span>
      </div>
      <div className="volunteer-calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          defaultView={Views.MONTH}
          views={[Views.MONTH, Views.WEEK]}
          step={180}
          timeslots={1}
          className="volunteer-shift-calendar"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          dayPropGetter={dayPropGetter}
          popup
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
        />
      </div>
      <ShiftDetailsModal
        isOpen={detailsOpen}
        onClose={closeDetails}
        shifts={detailsShifts}
        dateLabel={detailsDateLabel}
      />
    </div>
  );
}
