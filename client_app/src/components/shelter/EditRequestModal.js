import { useState, useEffect } from 'react';
import { ModalComponent } from './ModalComponent';
import { formatDate, formatTime } from '../../formatting/FormatDateTime';

export const EditRequestModal = ({ isOpen, onClose, shift, onSave }) => {
  const [updatedShift, setUpdatedShift] = useState(shift || { fromTime: "", toTime: "", volunteersRequested: 0 });
  const start_date = formatDate(updatedShift.shift_start);
  const start_time = formatTime(updatedShift.shift_start);
  const duration = (updatedShift.shift_end - updatedShift.shift_start) / (1000 * 60 * 60); // Convert milliseconds to hours
  useEffect(() => {
    if (shift) {
      setUpdatedShift(shift);
    }
  }, [shift]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedShift((prevShift) => ({
      ...prevShift,
      [name]: name === "required_volunteer_count" ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleSave = () => {
    onSave(updatedShift);
    onClose();
  };

  const renderData = () => (
    <div>
      <div className="title">
        <p>{start_date} {start_time} ({duration} hours)</p>
      </div>
      <label className="volunteersRequestedLabel">
        Volunteers Requested:
        <input
          type="number"
          name="required_volunteer_count"
          value={updatedShift.required_volunteer_count}
          onChange={handleChange}
        />
      </label>
      <button className="saveButton" onClick={handleSave}>Save</button>
      <button className="cancelButton" onClick={onClose}>Cancel</button>
    </div>
  );

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={onClose} renderData={renderData} />
  );
};