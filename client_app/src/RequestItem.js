import React, { Component } from 'react';
import { CalendarToday } from '@mui/icons-material';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import './styles/RequestItem.css';

class RequestItem extends Component {
  render() {
    const { request } = this.props;
    return (
      <div className="request-item-container">          
        <div className="calendar">
          <button>
            <CalendarToday />
          </button>
          <div className="date-time">
            <div className="request-details">
              <span>{request.date}</span>
              <span>{request.timeSlot}</span>
            </div>
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
          <button>
            <BorderColorRoundedIcon />
          </button>
        </div>
        <div className='delete'>
          <button>
            <CancelRoundedIcon />
          </button>
        </div>
      </div>
    );
  }
}

export default RequestItem;
