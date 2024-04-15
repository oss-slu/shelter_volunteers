import React from 'react';
import OpenRequest from './OpenRequests';

function ShelterDashboard() {
  const openRequestsData = [
    { id: 1, date: "Dec 1, 2022", timeSlot: "Morning (8am-12pm)", numVolunteersNeeded: 2 },
    { id: 2, date: "Dec 2, 2022", timeSlot: "Afternoon (1pm-5pm)", numVolunteersNeeded: 1 },
  ];
  
  return (
    <div>
      <h1 className="text-center">Shelter Dashboard</h1>
      <div className="shelter-dashboard">
        <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>Open requests</h1>
            <a href="/shelter/request">View all</a>
        </div>
          <div className="request-item-container">
            <OpenRequest data={openRequestsData} />
          </div>
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
