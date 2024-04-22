import React, { Component } from 'react';
// import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import './styles/PastVolunteers.css';

class PastVolunteers extends Component {
  render() {
    const { shiftDetails} = this.props;

    return (
      <div className="volunteers-item-container">       
        <div className="volunteers-item">
          <AccountCircleIcon />
          <span>{shiftDetails.label}</span>
          <NotificationsNoneIcon />
        </div>
        
        </div>
    );
  }
}

export default PastVolunteers;
