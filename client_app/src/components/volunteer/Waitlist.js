import { useState, useEffect, useCallback } from 'react';
import { waitlistAPI } from '../../api/waitlist';
import { formatDate, formatTime } from '../../formatting/FormatDateTime';
import Loading from '../Loading';

function VolunteerWaitlist() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [busyShiftId, setBusyShiftId] = useState(null);
  const [resultMessage, setResultMessage] = useState(null);

  const refresh = useCallback(async () => {
    const data = await waitlistAPI.getMine();
    setEntries(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (error) {
        console.error('Failed to load waitlist:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const handleLeave = async (shiftId) => {
    setBusyShiftId(shiftId);
    setResultMessage(null);
    try {
      await waitlistAPI.leave(shiftId);
      setResultMessage({
        text: 'Removed from the waitlist.',
        success: true,
      });
      await refresh();
    } catch (error) {
      setResultMessage({
        text: error?.message || 'Could not leave the waitlist. Please try again.',
        success: false,
      });
    } finally {
      setBusyShiftId(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!entries.length) {
    return (
      <div>
        <h1 className="title-small">Your Waitlist</h1>
        <div className="description">
          <p className="tagline-small">
            You aren&apos;t on any shift waitlists right now. When a shift you want is full,
            click &quot;Join Waitlist&quot; on the sign-up page and we&apos;ll move you in if a spot opens up.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="title-small">Your Waitlist</h1>
      <div className="description">
        <p className="tagline-small">
          These shifts are currently full. We&apos;ll automatically move you into a shift
          if a spot opens up before it starts.
        </p>
      </div>
      {resultMessage && (
        <div
          className={`waitlist-banner ${resultMessage.success ? 'waitlist-banner--success' : 'waitlist-banner--error'}`}
          role="status"
        >
          <span>{resultMessage.text}</span>
          <button
            type="button"
            className="waitlist-banner__dismiss"
            aria-label="Dismiss"
            onClick={() => setResultMessage(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="table-container desktop-only">
        <table className="shifts-table">
          <thead>
            <tr className="table-header">
              <th>Shelter</th>
              <th>Date</th>
              <th>Time</th>
              <th>Position</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const startDate = formatDate(entry.shift_start);
              const startTime = formatTime(entry.shift_start);
              const endTime = formatTime(entry.shift_end);
              const isBusy = busyShiftId === entry.service_shift_id;
              return (
                <tr key={entry.waitlist_entry_id || entry._id} className="table-row">
                  <td>{entry.shelter?.name || 'Unknown shelter'}</td>
                  <td>{startDate}</td>
                  <td>
                    {startTime} - {endTime}
                  </td>
                  <td>{entry.position ? `#${entry.position}` : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="waitlist-button waitlist-button--leave"
                      disabled={isBusy}
                      onClick={() => handleLeave(entry.service_shift_id)}
                    >
                      {isBusy ? '...' : 'Leave'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="cards-container mobile-only">
        {entries.map((entry) => {
          const startDate = formatDate(entry.shift_start);
          const startTime = formatTime(entry.shift_start);
          const endTime = formatTime(entry.shift_end);
          const isBusy = busyShiftId === entry.service_shift_id;
          return (
            <div
              key={entry.waitlist_entry_id || entry._id}
              className="dashboard-button table-row"
            >
              <div className="card-header">
                <div className="card-title">
                  <strong>{entry.shelter?.name || 'Unknown shelter'}</strong>
                </div>
                <div>
                  Position:{' '}
                  <span className="checkmark waitlisted">
                    {entry.position ? `#${entry.position}` : '—'}
                  </span>
                </div>
              </div>
              <div className="card-details">
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span>{startDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span>
                    {startTime} - {endTime}
                  </span>
                </div>
                <div className="detail-row waitlist-action-row">
                  <button
                    type="button"
                    className="waitlist-button waitlist-button--leave"
                    disabled={isBusy}
                    onClick={() => handleLeave(entry.service_shift_id)}
                  >
                    {isBusy ? '...' : 'Leave Waitlist'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default VolunteerWaitlist;
