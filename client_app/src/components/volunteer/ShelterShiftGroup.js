import { Address } from './Address';
import { PriorityBadge } from './PriorityBadge';

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

function weekday(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'short' });
}

function ShiftStatus({ shiftData, onWaitlistToggle }) {
  const { isSelected, signedUp, hasConflict, isFull, waitlisted, canJoinWaitlist, waitlistBusy, shift } = shiftData;

  if (signedUp) return <span className="signup-pill signup-pill--signed">Signed up</span>;
  if (isSelected) return <span className="signup-pill signup-pill--selected">Selected</span>;

  if (isFull && onWaitlistToggle && (canJoinWaitlist || waitlisted)) {
    return (
      <div className="signup-status-stack">
        <span className={`signup-pill ${waitlisted ? 'signup-pill--waitlisted' : 'signup-pill--full'}`}>
          {waitlisted ? 'On waitlist' : 'Full'}
        </span>
        <button
          type="button"
          className={`waitlist-button ${waitlisted ? 'waitlist-button--leave' : 'waitlist-button--join'}`}
          disabled={waitlistBusy}
          onClick={(event) => {
            event.stopPropagation();
            onWaitlistToggle(shift);
          }}
        >
          {waitlistBusy ? '…' : waitlisted ? 'Leave waitlist' : 'Join waitlist'}
        </button>
      </div>
    );
  }
  if (isFull) return <span className="signup-pill signup-pill--full">Full</span>;
  if (hasConflict) return <span className="signup-pill signup-pill--conflict">Time conflict</span>;
  if (!shift.can_sign_up) return <span className="signup-pill signup-pill--muted">Sign-up closed</span>;
  return null;
}

function ShiftOption({ shiftData, shelterName, onToggle, onWaitlistToggle, isInstructionsOpen, onInstructionsToggle }) {
  const { shift, isSelected, signedUp, canInteract, startDate, startTime, endTime, duration } = shiftData;
  const panelId = `signup-instructions-${shift._id}`;
  const checkboxId = `signup-shift-${shift._id}`;
  const label = `${weekday(shift.shift_start)} ${startDate}, ${startTime} to ${endTime} at ${shelterName}`;

  // The <label> makes the whole row (date, volunteers, priority) toggle the
  // checkbox natively. Buttons stay outside it, as labels may not contain them.
  return (
    <li className={`signup-shift ${isSelected ? 'is-selected' : ''} ${canInteract ? 'is-selectable' : 'is-disabled'}`}>
      <label className="signup-shift-main" htmlFor={checkboxId}>
        <span className="signup-shift-check">
          <input
            id={checkboxId}
            type="checkbox"
            checked={isSelected || signedUp}
            disabled={!canInteract}
            onChange={() => canInteract && onToggle(shift)}
            aria-label={`Select shift: ${label}`}
          />
        </span>
        <span className="signup-shift-when">
          <span className="signup-shift-date">
            {weekday(shift.shift_start)}, {startDate}
          </span>
          <span className="signup-shift-time">
            {startTime} – {endTime} <span className="signup-shift-duration">({duration}h)</span>
          </span>
        </span>
        <span className="signup-shift-volunteers">
          <span className="signup-shift-count">
            {shift.volunteer_count} / {shift.required_volunteer_count}
          </span>{' '}
          volunteers
          <span className="signup-shift-max">max {shift.max_volunteer_count}</span>
        </span>
        <span className="signup-shift-priority">
          <PriorityBadge priority={shiftData.priority} />
        </span>
      </label>
      <div className="signup-shift-status">
        <ShiftStatus shiftData={shiftData} onWaitlistToggle={onWaitlistToggle} />
      </div>
      {shiftData.hasInstructions && (
        <div className="signup-shift-extra">
          <button
            type="button"
            className="signup-shift-instructions-toggle"
            aria-expanded={isInstructionsOpen}
            aria-controls={panelId}
            onClick={() => onInstructionsToggle(shift._id)}
          >
            {isInstructionsOpen ? 'Hide instructions' : 'View instructions'}
          </button>
          {isInstructionsOpen && (
            <div id={panelId} className="signup-shift-instructions">
              <div className="instructions-title">Shelter instructions</div>
              <div className="instructions-content">{shiftData.instructions}</div>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * One shelter with its open shifts, each selectable with a checkbox.
 * `shiftsData` items are the objects produced by ShiftSignUp's processShiftData.
 */
export function ShelterShiftGroup({
  shelter,
  shiftsData,
  onToggle,
  onWaitlistToggle,
  expandedInstructions,
  onInstructionsToggle,
}) {
  const name = shelter?.name || 'Shelter';
  const headingId = `signup-shelter-${shelter?._id || name}`;
  const selectedCount = shiftsData.filter((s) => s.isSelected).length;
  const topPriority = shiftsData.reduce(
    (best, s) => ((PRIORITY_RANK[s.priority] || 0) > (PRIORITY_RANK[best] || 0) ? s.priority : best),
    null,
  );

  return (
    <section className="signup-shelter" aria-labelledby={headingId}>
      <header className="signup-shelter-header">
        <div className="signup-shelter-identity">
          <h3 id={headingId} className="signup-shelter-name">{name}</h3>
          {shelter?.address && (
            <div className="signup-shelter-address">
              <Address address={shelter.address} />
            </div>
          )}
        </div>
        <div className="signup-shelter-meta">
          <span className="signup-shelter-count">
            {shiftsData.length} upcoming shift{shiftsData.length !== 1 ? 's' : ''}
          </span>
          {selectedCount > 0 && (
            <span className="signup-pill signup-pill--selected">{selectedCount} selected</span>
          )}
          {topPriority && (
            <span className="signup-shelter-need">
              Need <PriorityBadge priority={topPriority} />
            </span>
          )}
        </div>
      </header>
      <ul className="signup-shift-list">
        {shiftsData.map((shiftData) => (
          <ShiftOption
            key={shiftData.shift._id}
            shiftData={shiftData}
            shelterName={name}
            onToggle={onToggle}
            onWaitlistToggle={onWaitlistToggle}
            isInstructionsOpen={expandedInstructions.has(shiftData.shift._id)}
            onInstructionsToggle={onInstructionsToggle}
          />
        ))}
      </ul>
    </section>
  );
}

/**
 * Group shifts by shelter and order the groups by `sortBy`:
 *  - 'date': shelter with the soonest shift first (shifts inside by time)
 *  - 'shelter': shelter name A–Z (shifts inside by time)
 *  - 'need': shelter with the greatest need first (shifts inside by need, then time)
 */
export function groupShiftsByShelter(shifts, shelterMap, sortBy, needOf) {
  const groups = new Map();
  for (const shift of shifts) {
    const key = shift.shelter_id;
    if (!groups.has(key)) groups.set(key, { shelterId: key, shelter: shelterMap[key], shifts: [] });
    groups.get(key).shifts.push(shift);
  }

  const byTime = (a, b) => a.shift_start - b.shift_start;
  const list = [...groups.values()].map((group) => {
    const inner = [...group.shifts].sort(
      sortBy === 'need' ? (a, b) => needOf(b) - needOf(a) || byTime(a, b) : byTime,
    );
    return {
      ...group,
      shifts: inner,
      firstStart: Math.min(...inner.map((s) => s.shift_start)),
      maxNeed: Math.max(...inner.map(needOf)),
      name: group.shelter?.name || '',
    };
  });

  list.sort((a, b) => {
    if (sortBy === 'shelter') return a.name.localeCompare(b.name);
    if (sortBy === 'need') return b.maxNeed - a.maxNeed || a.firstStart - b.firstStart;
    return a.firstStart - b.firstStart || a.name.localeCompare(b.name);
  });
  return list;
}
