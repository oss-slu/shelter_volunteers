const ProcessVolunteerList = ({shiftDetails}) => {
    const currentTime = Date.now();
    const filteredShifts = shiftDetails.filter(item => item.start_time < currentTime);
    const workerList = filteredShifts
    .flatMap(item => item.worker ? item.worker.split(",").map(name => name.trim()) : []);
    const uniqueWorker = [...new Set(workerList)];

    return (
      <>
        <div className="conf-page">
          <h1>Past Volunteers</h1>
          <table>
            <thead>
              <tr>
                <th>
                  <h2>#</h2>
                </th>
                <th>
                  <h2>Volunteer Name</h2>
                </th>
                <th>
                  <h2>Volunteer Email</h2>
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueWorker.map((worker, index) => (
                <tr key={index}>
                  <td>
                    <p>{index+1}</p>
                  </td>
                  <td>
                    <p>{worker}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
}

export default ProcessVolunteerList;