import { formatDate, displayTime, timeStringToMillis } from "../../formatting/FormatDateTime";

export const DesktopShiftRow = ({ index, shift, updateShift, deleteShift }) => {
  return (
    <tr key={index}>
      {shift.date && (
        <td>
          <input
            type="text"
            value={formatDate(shift.date)}
            readOnly
          />
        </td>
      )} 
      <td>
        <input
          type="text"
          value={shift.shiftName}
          onChange={(e) => updateShift(index, "shiftName", e.target.value)}
      />
      </td>
      <td>
        <input
          type="time"
          value={shift.startTime}
          onChange={(e) => updateShift(index, "startTime", e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          value={shift.duration}
          onChange={(e) => updateShift(index, "duration", e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          value={displayTime((timeStringToMillis(shift.startTime) + shift.duration * 60 * 60 * 1000) % 86400000)}
          readOnly
        />
      </td>
      <td>
        <input
          type="number"
          min="1"
          value={shift.requiredVolunteers}
          onChange={(e) => updateShift(index, "requiredVolunteers", e.target.value)}
        />
      </td>
      <td>
        <input
          type="number"
          min="1"
          value={shift.maxVolunteers}
          onChange={(e) => updateShift(index, "maxVolunteers", e.target.value)}
        />
      </td>
      <td>
        <button onClick={() => deleteShift(index)}>Delete</button>
      </td>
    </tr>
  );
}