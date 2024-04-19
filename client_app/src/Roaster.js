import React, { Component } from 'react';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import './Roaster.css';

class Roaster extends Component {
  render() {
    const { shiftDetails, volunteers, pro } = this.props;

    return (
      <div className="roaster-item-container">
        <progress value={pro} style={{ width: '100%' }}/>
        
        <div className="roaster-item">
          <PeopleAltIcon />
          <span>{shiftDetails.label}</span>
          <span>{shiftDetails.time}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {volunteers.map((volunteer, index) => (
            <span key={index}>{volunteer}</span>
          ))}
        </div>
      </div>
    );
  }
}

export default Roaster;
