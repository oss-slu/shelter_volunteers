const ProcessVolunteerList = ({shiftDetails}) => {
    const currentTime = Date.now();
    const filteredShifts = shiftDetails.filter(item => item.start_time < currentTime);
    // const workerList = filteredShifts
    // .flatMap(item => item.worker ? item.worker.split(",").map(name => name.trim()) : []);
    // const uniqueWorker = [...new Set(workerList)];
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
              {uniqueWorkerList.map((list, index) => (
                <tr key={index}>
                  <td>
                    <p>{index+1}</p>
                  </td>
                  <td>
                    <p>{list.worker}</p>
                  </td>
                  <td>
                    <p>{list.email}</p>
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