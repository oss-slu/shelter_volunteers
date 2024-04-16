import React, { Component } from 'react';
import Roaster from './Roaster';

class ShiftContainer extends Component {
  render() {
    // Mock data for shifts
    const mockShifts = [
      {
        id: 1,
        date: "Monday, Dec 1, 2024",
        shifts: [
          { label: "Morning Shift", time: "9 AM - 11 AM", volunteers: ["John Doe", "Jane Smith"] },
          { label: "Afternoon Shift", time: "1 PM - 3 PM", volunteers: ["David Johnson", "Emily Brown", "Michael Wilson"] },
          { label: "Evening Shift", time: "5 PM - 7 PM", volunteers: ["Sarah Miller", "Robert Jones", "Lisa Davis"] }
        ]
      },
    //   {
    //     id: 2,
    //     date: "Tuesday, Dec 2, 2024",
    //     shifts: [
    //       { label: "Evening Shift", time: "5 PM - 7 PM", volunteers: ["Sarah Miller", "Robert Jones", "Lisa Davis"] }
    //     ]
    //   },
      // Add more shifts as needed
    ];

    return (
      <div className="shift-container">
        {mockShifts.map(shift => (
          <div key={shift.id} className="shift-row">
            {/* <h2>{shift.date}</h2> */}
            <div className="roaster-list">
              {shift.shifts.map((shiftData, index) => (
                <Roaster key={index} shiftDetails={shiftData} volunteers={shiftData.volunteers} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default ShiftContainer;
