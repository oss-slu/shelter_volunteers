import React, { Component } from 'react';
import { CalendarToday, Edit, Delete } from '@mui/icons-material';
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
          <span>{request.numVolunteersNeeded}</span>
          <Edit />
          <Delete />
        </div>
      </div>
    );
  }
}

export default RequestItem;
