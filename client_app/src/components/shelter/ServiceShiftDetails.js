import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/RequestItem.css";


const ServiceShiftDetails = ({shift, view, cancel, edit}) => {

  const date = new Date(shift.shift_start).toLocaleDateString(
    'en-US', { day: 'numeric', month: 'long', year: 'numeric' }
  );
  const startTime = new Date(shift.shift_start).toLocaleTimeString(
    [], { hour: '2-digit', minute: '2-digit', hour12: true }
  );
  const endTime = new Date(shift.shift_end).toLocaleTimeString(
    [], { hour: '2-digit', minute: '2-digit', hour12: true }
  );


  return (
    <div className="request-item-container">
      <div className="calendar">
        <div className="date-time">
          <div className="request-details">
            <span>{date}</span>
            <span>{startTime} - {endTime}</span>
          </div>
        </div>
      </div>
      <div className="info">
        <button onClick={() => view(shift)}>
          <FontAwesomeIcon icon={faUsers} />
          <span> {shift.volunteers.length} / {shift.required_volunteer_count}</span>
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
}

export default ServiceShiftDetails;
