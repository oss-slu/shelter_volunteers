import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import "../../styles/shelter/PastVolunteers.css";

const PastVolunteers = ({shiftDetails}) => {
    const currentTime = Date.now();
    const filteredShifts = shiftDetails.filter(item => item.start_time < currentTime);
    const workerList = filteredShifts
    .flatMap(item => item.worker ? item.worker.split(",").map(name => name.trim()) : []);
    const uniqueWorker = [...new Set(workerList)];

    return (
      <div className="past-volunteers-container">
        {uniqueWorker.length > 0 ? (uniqueWorker.slice(0,3).map((name, index) => (
          <div key={index} className="volunteers-item-container"> 
            <div className="volunteers-item">
              <AccountCircleIcon />
              <span>{name}</span>
              <NotificationsNoneIcon />
            </div>
          </div>
          ))
        ) : (
          <span>No past volunteers available.</span>
       )}
      </div>
    );
}
export default PastVolunteers;