import { useEffect, useState } from "react";
import { waitlistAPI } from "../../api/waitlist";
import "../../styles/shelter/ShiftWaitlistModal.css";

const formatJoinTime = (joinedAt) => {
  const date = new Date(joinedAt);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
};

const ShiftWaitlistModal = ({ isOpen, onClose, shelterId, shift }) => {
  const [queue, setQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isOpen || !shelterId || !shift?._id) return undefined;

    let ignoreResult = false;
    setIsLoading(true);
    setError("");

    waitlistAPI
      .getForShift(shelterId, shift._id)
      .then((entries) => {
        if (!ignoreResult) setQueue(entries);
      })
      .catch((requestError) => {
        console.error("Error loading shift waitlist:", requestError);
        if (!ignoreResult) {
          setQueue([]);
          setError(requestError?.message || "The waitlist could not be loaded. Please try again.");
        }
      })
      .finally(() => {
        if (!ignoreResult) setIsLoading(false);
      });

    return () => {
      ignoreResult = true;
    };
  }, [isOpen, refreshKey, shelterId, shift?._id]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !shift) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}>
      <div
        className="modal-content shift-waitlist-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-waitlist-title">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close waitlist">
          &times;
        </button>
        <div className="shift-waitlist-modal__header">
          <div>
            <p className="shift-waitlist-modal__eyebrow">Upcoming shift</p>
            <h2 id="shift-waitlist-title">{shift.shift_name || "Shift"} Waitlist</h2>
          </div>
          {!isLoading && !error && (
            <span className="shift-waitlist-modal__count">{queue.length} waiting</span>
          )}
        </div>
        {isLoading ? (
          <div className="shift-waitlist-modal__state" role="status">
            <span className="shift-waitlist-modal__spinner" aria-hidden="true" />
            Loading waitlist...
          </div>
        ) : error ? (
          <div className="shift-waitlist-modal__state shift-waitlist-modal__error">
            <p role="alert">{error}</p>
            <button type="button" onClick={() => setRefreshKey((key) => key + 1)}>
              Try again
            </button>
          </div>
        ) : queue.length === 0 ? (
          <div className="shift-waitlist-modal__state">
            <span className="material-symbols-outlined" aria-hidden="true">
              group_off
            </span>
            <h3>No volunteers are waiting</h3>
            <p>New volunteers will appear here when this shift reaches capacity.</p>
          </div>
        ) : (
          <div className="shift-waitlist-modal__table-wrapper">
            <table className="shift-waitlist-modal__table">
              <thead>
                <tr>
                  <th scope="col">Position</th>
                  <th scope="col">Volunteer</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((entry, index) => (
                  <tr key={entry._id || `${entry.volunteer_id}-${entry.joined_at}`}>
                    <td>
                      <span className="shift-waitlist-modal__position">
                        {entry.position || index + 1}
                      </span>
                    </td>
                    <td>{entry.volunteer_id}</td>
                    <td>{formatJoinTime(entry.joined_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftWaitlistModal;
