import React from 'react';
import OpenRequest from './OpenRequests';
// import Roaster from './Roaster';
import ShiftContainer from './ShiftContainer';
import './index.css';

function ShelterDashboard() {
  
  return (
    <div>
      <h1 className="text-center">Shelter Dashboard</h1>
      <div className="shelter-dashboard">
        <div className="container-large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width:'98%' }}>
              <h4>Open requests</h4>
              <a href="/shelter/request">View all</a>
          </div>
          {/* <div className="request-item-container"> */}
            <OpenRequest />
          {/* </div> */}
        </div>
        <div className="container-medium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width:'98%' }}>
            <h4>Today's Roaster</h4>
            <a href="/shelter/request">View all</a>
          </div>
          <ShiftContainer />
          {/* <Roaster /> */}

        </div>
        <div className="container-small">
          <h1>Contact Past Volunteers</h1>
          <button>click here</button>
        </div>
      </div>
    </div>
  );
}

export default ShelterDashboard;
