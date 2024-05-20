import React, { Component } from "react";
import PastVolunteers from "./PastVolunteers";

class PastVolunteersContainer extends Component {
  render() {
    // Mock data for past shifts
    const mockPastShifts = [
      {
        id: 1,
        date: "Monday, Dec 1, 2024",
        shifts: [{ label: "John Doe" }, { label: "David Johnson" }, { label: "Sarah Miller" }],
      },
    ];

    return (
      <div className="past-volunteers-container">
        {mockPastShifts.map((shift) => (
          <div key={shift.id} className="shift-row">
            <div className="roster-list">
              {shift.shifts.map((shiftData, index) => (
                <PastVolunteers
                  key={index}
                  shiftDetails={shiftData}
                  volunteers={shiftData.volunteers}
                  pro={shiftData.pro}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default PastVolunteersContainer;
