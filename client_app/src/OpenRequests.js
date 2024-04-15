import React, { Component } from 'react';
import RequestItem from './RequestItem';


class OpenRequests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        { id: 1, date: "Dec 1, 2022", timeSlot: "Morning (8am-12pm)", numVolunteersNeeded: 2 },
        { id: 2, date: "Dec 2, 2022", timeSlot: "Afternoon (1pm-5pm)", numVolunteersNeeded: 1 },
      ],
    };
  }

  render() {
    const { data } = this.state;

    return (
      <div className="open-requests">
        {data.map(request => (
          <RequestItem key={request.id} request={request} />
        ))}
      </div>
    );
  }
}

export default OpenRequests;
