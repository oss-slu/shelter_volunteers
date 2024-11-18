import { Link } from "react-router-dom";

const handleReload = () => {
  window.location.reload();
};

const ProcessTodaysShiftsList = ({ shiftDetails }) => {
  const currentDate = new Date().toDateString();

  const todaysShifts = shiftDetails.filter(
    (item) => new Date(item.start_time).toDateString() === currentDate
  );

  const renderShiftsTable = () => (
    <table>
      <thead>
        <tr>
          <th>
            <h3>#</h3>
          </th>
          <th>
            <h3>Volunteer Name</h3>
          </th>
          <th>
            <h3>Start Time</h3>
          </th>
          <th>
            <h3>End Time</h3>
          </th>
        </tr>
      </thead>
      <tbody>
        {todaysShifts.map((shift, shiftIndex) => {
          const volunteers = shift.worker
            ? shift.worker.split(",").map((name) => name.trim()) 
            : ["No Volunteers"]; 

          return volunteers.map((volunteer, volunteerIndex) => (
            <tr key={`${shiftIndex}-${volunteerIndex}`}>
              <td>{shiftIndex + 1}</td>
              <td>{volunteer}</td>
              <td>{new Date(shift.start_time).toLocaleTimeString()}</td>
              <td>{new Date(shift.end_time).toLocaleTimeString()}</td>
            </tr>
          ));
        })}
      </tbody>
    </table>
  );

  return (
    <>
      <div className="conf-page">
        <h1>Today's Shifts</h1>
        {(!todaysShifts || todaysShifts.length === 0) ? (
          <div>
            <span>No shifts available for today.</span>
          </div>
        ) : (
          renderShiftsTable()
        )}
        <br />
        <div className="button-row">
          <Link to="/shelter-dashboard" onClick={handleReload}>
            <button>Your Dashboard</button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default ProcessTodaysShiftsList;

