import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import "../../styles/shelter/RequestItem.css";
import { formatTime } from "../../formatting/FormatDateTime";

const ServiceShiftDetails = ({ shift, view, cancel, edit }) => {
  const startTime = formatTime(shift.shift_start);
  const endTime = formatTime(shift.shift_end);

  return (
    <div className="request-item-container">
      <div className="calendar">
        <div className="date-time">
          <div className="request-details d-flex flex-row">
            <span>
              {shift.shift_name && shift.shift_name + " - "}
              {startTime} - {endTime}
            </span>
          </div>
        </div>
      </div>
      <div className="info">
        <button onClick={() => view(shift)}>
          <FontAwesomeIcon icon={faUsers} />
          <span>
            {" "}
            {shift.volunteers.length} / {shift.required_volunteer_count}
          </span>
        </button>
      </div>
      <div className="edit">
        <button onClick={() => edit(shift)}>
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>
      <div className="delete">
        <button onClick={() => cancel(shift)}>
          <FontAwesomeIcon icon={faTrashCan} />
        </button>
      </div>
    </div>
  );
};

export default ServiceShiftDetails;
