import Modal from 'react-modal';
import { formatTime } from '../../formatting/FormatDateTime';
import { Address } from './Address';
import '../../styles/volunteer/ShiftDetailsModal.css';

/**
 * Modal showing shift details for a selected date or event:
 * date label and for each shift: shelter name, address, time (start–end).
 */
export default function ShiftDetailsModal({ isOpen, onClose, shifts = [], dateLabel = '' }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="shift-details-modal"
      overlayClassName="shift-details-overlay"
      ariaHideApp={false}
    >
      <div className="shift-details-header">
        <h3 className="shift-details-title">Shift details</h3>
        {dateLabel && <p className="shift-details-date">{dateLabel}</p>}
        <button
          type="button"
          className="shift-details-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="shift-details-body">
        {shifts.length === 0 ? (
          <p className="tagline-small">No shifts on this day.</p>
        ) : (
          <ul className="shift-details-list">
            {shifts.map((c) => (
              <li key={c._id} className="shift-details-item">
                <span className="shift-details-shelter">{c.shelter?.name || 'Shelter'}</span>
                {c.shelter?.address && (
                  <span className="shift-details-address">
                    <Address address={c.shelter.address} />
                  </span>
                )}
                <span className="shift-details-time">
                  {formatTime(c.shift_start)} – {formatTime(c.shift_end)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
