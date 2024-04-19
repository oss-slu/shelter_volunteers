import React, { Component } from 'react';
import { CalendarToday, Edit, Delete } from '@mui/icons-material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import './RequestItem.css';

class RequestItem extends Component {
  render() {
    const { request } = this.props;
    return (
      <div className="request-item-container">
        <div className="calendar">
          <CalendarToday />
        </div>
        <div className="date-time">
          <div className="request-details">
            <span>{request.date}</span>
            <span>{request.timeSlot}</span>
          </div>
        </div>
        <div className="volunteers">
            <div className="volunteers-info">
                <PeopleAltIcon />
                <span>{request.numVolunteersNeeded}</span>
            </div>
            <div className="progress-bar">
                <progress value={request.numVolunteersSignedUp/request.numVolunteersNeeded} />
            </div>
        </div>
        <div className='edit'>
            <Edit />
        </div>
        <div className='delete'>
            <Delete />
        </div>
      </div>
    );
  }
}

export default RequestItem;
