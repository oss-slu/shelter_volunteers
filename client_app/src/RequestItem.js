import React, { Component } from 'react';
import { CalendarToday, Edit, Delete } from '@mui/icons-material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import './RequestItem.css';

class RequestItem extends Component {
  render() {
    const { request } = this.props;
    return (
      <div className="request-item-container">
        <div className="request-item">
          <CalendarToday />
          <div className="request-details">
            <span>{request.date}</span>
            <span>{request.timeSlot}</span>
          </div>
          <Edit />
          <Delete />
        </div>
        <div className="request-volunteers">
          <span>{request.numVolunteersNeeded} Volunteers SignedUp</span>
          <PeopleAltIcon />
          <progress value={0.5} />
        </div>
      </div>
    );
  }
}

export default RequestItem;
