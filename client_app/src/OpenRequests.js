import React, { Component } from 'react';
import RequestItem from './RequestItem';


class OpenRequests extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [
        { id: 1, date: "Monday, Dec 1, 2024", timeSlot: " Morning (8am-12pm)", numVolunteersNeeded: 20, numVolunteersSignedUp: 2},
        { id: 2, date: "Tuesday, Dec 2, 2024", timeSlot: " Afternoon (1pm-5pm)", numVolunteersNeeded: 10, numVolunteersSignedUp: 5},
        { id: 3, date: "Wednesday, Dec 3, 2024", timeSlot: " Evening (5pm-9pm)", numVolunteersNeeded: 10, numVolunteersSignedUp: 5},
        { id: 4, date: "Thursday, Dec 4, 2024", timeSlot: " Afternoon (1pm-5pm)", numVolunteersNeeded: 10, numVolunteersSignedUp: 5},
        { id: 5, date: "Friday, Dec 5, 2024", timeSlot: " Morning (8am-12pm)", numVolunteersNeeded: 10, numVolunteersSignedUp: 5}
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
