function ShelterDashboard() {
  return (
    <div>
      <h1 className="text-center">Shelter Dashboard</h1>
      <div className="shelter-dashboard">
        <div className="container">
          <h1>Manage Volunteer Shifts</h1>
          <div className="shift-card">
            <h4>Dec 1, 2022</h4>
            <p>5 Shifts need help</p>
            <button>View/Edit Schedule</button>
          </div>
          <div className="shift-card">
            <h4>Dec 2, 2022</h4>
            <p>3 Shifts need help</p>
            <button>View/Edit Schedule</button>
          </div>
          <div className="shift-card">
            <h4>Dec 3, 2022</h4>
            <p>2 Shifts need help</p>
            <button>View/Edit Schedule</button>
          </div>
          <button>More Dates</button>
        </div>
        <div className="container">
          <h1>Occupancy List</h1>
          <div className="shift-card">
            <p>Current occupancy : 25</p>
            <p>Total beds: 25</p>
            <p>Current Volunteers: 3</p>
          </div>
        </div>
        <div className="container">
          <h1>Contact Past Volunteers</h1>
          <button>click here</button>
        </div>
      </div>
    </div>
  );
}

export default ShelterDashboard;
