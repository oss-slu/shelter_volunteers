import { useEffect, useId, useRef, useState } from 'react';
import {
  CalendarPlus,
  CircleCheck,
  CircleX,
  Clock,
  Download,
  MapPin,
  TriangleAlert,
  X,
} from 'lucide-react';
import {
  CALENDAR_EXPORT_NOTICE,
  downloadShiftCalendar,
  downloadShiftsCalendar,
  googleCalendarUrl,
  hasValidShiftTimes,
} from '../../utils/shiftCalendar';
import '../../styles/volunteer/SignUpResults.css';

const longDate = (ts) =>
  new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const shortTime = (ts) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

function durationLabel(shift) {
  const hours = (shift.shift_end - shift.shift_start) / 3600000;
  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hour${rounded === 1 ? '' : 's'}`;
}

function addressLine(address) {
  if (!address) return '';
  return [address.street1, address.street2, address.city, [address.state, address.postal_code].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');
}

/** Turn API failure messages into something a volunteer can act on. */
export function friendlyReason(message) {
  if (!message) return 'Something went wrong. Please try again.';
  if (/overlap/i.test(message)) return 'It overlaps with another shift you are already signed up for.';
  if (/full/i.test(message)) return 'This shift filled up. You can join its waitlist from the sign-up list.';
  if (/non-existing/i.test(message)) return 'This shift is no longer available.';
  return message;
}

function ConfirmedShift({ item }) {
  const { shift, shelter } = item;
  const calendarShift = { ...shift, shelter };
  const canExport = hasValidShiftTimes(shift) && shift.shift_start > Date.now();
  const [downloadFailed, setDownloadFailed] = useState(false);
  const address = addressLine(shelter?.address);
  const instructions = (shift.instructions || '').trim();

  return (
    <li className="signup-confirm-shift">
      <div className="signup-confirm-shift-head">
        <h3 className="signup-confirm-shelter">{shelter?.name || 'Shelter'}</h3>
        {shift.shift_name && <span className="signup-confirm-shift-name">{shift.shift_name}</span>}
        <span className="signup-confirm-pending">Awaiting shelter confirmation</span>
      </div>
      <dl className="signup-confirm-facts">
        <div>
          <dt><CalendarPlus size={16} aria-hidden="true" /><span className="visually-hidden">Date</span></dt>
          <dd>{longDate(shift.shift_start)}</dd>
        </div>
        <div>
          <dt><Clock size={16} aria-hidden="true" /><span className="visually-hidden">Time</span></dt>
          <dd>
            {shortTime(shift.shift_start)} – {shortTime(shift.shift_end)}
            <span className="signup-confirm-muted"> · {durationLabel(shift)}</span>
          </dd>
        </div>
        {address && (
          <div>
            <dt><MapPin size={16} aria-hidden="true" /><span className="visually-hidden">Address</span></dt>
            <dd>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {address}
              </a>
            </dd>
          </div>
        )}
      </dl>
      {instructions && (
        <div className="signup-confirm-instructions">
          <div className="signup-confirm-instructions-title">From the shelter</div>
          <p>{instructions}</p>
        </div>
      )}
      {canExport && (
        <div className="signup-confirm-calendar" aria-label={`Add ${shelter?.name || 'this shift'} to your calendar`}>
          <a
            className="btn btn-outline-primary btn-sm"
            href={googleCalendarUrl(calendarShift)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <CalendarPlus size={16} aria-hidden="true" /> Google Calendar
          </a>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              setDownloadFailed(false);
              try {
                downloadShiftCalendar(calendarShift);
              } catch {
                setDownloadFailed(true);
              }
            }}
          >
            <Download size={16} aria-hidden="true" /> Apple / Outlook (.ics)
          </button>
        </div>
      )}
      {downloadFailed && (
        <p className="signup-confirm-error" role="alert">
          Could not create the calendar file. Please try again.
        </p>
      )}
    </li>
  );
}

/**
 * Dialog shown after a volunteer submits shift sign-ups. A successful sign-up
 * still needs the shelter admin's approval, so nothing here says "confirmed".
 * `items` is one entry per requested shift: { shift, shelter, result }
 * where result is the API's { success, message } for that shift.
 */
function SignUpResults({ items, userName, onClose, onViewUpcoming }) {
  const titleId = useId();
  const closeRef = useRef(null);
  const signedUp = items.filter((i) => i.result?.success);
  const failed = items.filter((i) => !i.result?.success);
  const exportable = signedUp
    .map((i) => ({ ...i.shift, shelter: i.shelter }))
    .filter((s) => hasValidShiftTimes(s) && s.shift_start > Date.now());
  const firstName = (userName || '').trim().split(/\s+/)[0];

  useEffect(() => {
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  let tone = 'success';
  let Icon = CircleCheck;
  let title = firstName ? `Thanks, ${firstName} — you're signed up!` : "Thanks — you're signed up!";
  let summary = `The shelter will review your sign-up${signedUp.length === 1 ? '' : 's'} and confirm your spot. Here are the details.`;
  if (signedUp.length && failed.length) {
    tone = 'partial';
    Icon = TriangleAlert;
    title = `You signed up for ${signedUp.length} of ${items.length} shifts`;
    summary = 'The shelter will review and confirm the ones that went through. Some could not be submitted — details are below.';
  } else if (!signedUp.length) {
    tone = 'failed';
    Icon = CircleX;
    title = "We couldn't sign you up";
    summary = items.length === 1 ? 'This sign-up could not be submitted.' : 'None of these sign-ups could be submitted.';
  }

  return (
    <div className="signup-confirm-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="signup-confirm" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button ref={closeRef} type="button" className="signup-confirm-close" aria-label="Close" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
        <header className={`signup-confirm-header signup-confirm-header--${tone}`}>
          <span className="signup-confirm-icon" aria-hidden="true"><Icon size={28} /></span>
          <h2 id={titleId} className="signup-confirm-title">{title}</h2>
          <p className="signup-confirm-summary">{summary}</p>
        </header>
        <div className="signup-confirm-body">
          {signedUp.length > 0 && (
            <section aria-label="Your sign-ups">
              {exportable.length > 1 && (
                <div className="signup-confirm-all">
                  <span>Hold the time for all of these shifts in your calendar:</span>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => downloadShiftsCalendar(exportable)}
                  >
                    <Download size={16} aria-hidden="true" /> Add all to calendar (.ics)
                  </button>
                </div>
              )}
              <ul className="signup-confirm-list">
                {signedUp.map((item) => (
                  <ConfirmedShift key={item.shift._id} item={item} />
                ))}
              </ul>
            </section>
          )}
          {failed.length > 0 && (
            <section className="signup-confirm-failed" aria-label="Sign-ups not submitted">
              <h3 className="signup-confirm-section-title">Not submitted</h3>
              <ul>
                {failed.map((item) => (
                  <li key={item.shift._id}>
                    <strong>{item.shelter?.name || 'Shelter'}</strong>
                    <span className="signup-confirm-muted">
                      {' '}· {longDate(item.shift.shift_start)}, {shortTime(item.shift.shift_start)}
                    </span>
                    <div className="signup-confirm-reason">{friendlyReason(item.result?.message)}</div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
        <footer className="signup-confirm-footer">
          {exportable.length > 0 && (
            <p className="signup-confirm-note">
              Adding a shift to your calendar does not guarantee your spot; the shelter still needs to confirm it.{' '}
              {CALENDAR_EXPORT_NOTICE}
            </p>
          )}
          <div className="signup-confirm-actions">
            {signedUp.length > 0 && onViewUpcoming && (
              <button type="button" className="btn btn-outline-secondary" onClick={onViewUpcoming}>
                View my shifts
              </button>
            )}
            <button type="button" className="btn btn-primary" onClick={onClose}>
              {signedUp.length ? 'Done' : 'Back to shifts'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default SignUpResults;
