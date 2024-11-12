import { Link } from "react-router-dom";

const handleReload = () => {
  window.location.reload();
};

const ProcessVolunteerList = ({shiftDetails}) => {
    const currentTime = Date.now();
    const filteredShifts = shiftDetails.filter(item => item.start_time < currentTime);
    const workerList = filteredShifts.flatMap(item => {
        const workers = item.worker ? item.worker.split(",").map(name => name.trim()) : [];
        const emails = item.email ? item.email.split(",").map(email => email.trim()) : [];
        
        return workers.map((name, index) => ({
          worker: name,
          email: emails[index]
        }));
    });

    const uniqueWorkerList = workerList.filter((entry, index, self) =>
        index === self.findIndex(e => e.worker === entry.worker && e.email === entry.email)
    );

    const renderVolunteerTable = () => (
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
              <h3>Volunteer Email</h3>
            </th>
          </tr>
        </thead>
        <tbody>
          {uniqueWorkerList.map((list, index) => (
            <tr key={index}>
              <td>
                <p>{index + 1}</p>
              </td>
              <td>
                <p>{list.worker}</p>
              </td>
              <td>
                <a href={`mailto:${list.email}`}>
                  <p>{list.email}</p>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    return (
      <>
        <div className="conf-page">
          <h1>Past Volunteers</h1>
          {(!uniqueWorkerList || uniqueWorkerList.length === 0) ? (
            <div>
              <span>No past volunteers available.</span>
            </div>
          ) : (
            renderVolunteerTable()
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
}

export default ProcessVolunteerList;