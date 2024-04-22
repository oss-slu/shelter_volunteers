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
          { label: "Volunteers", time: "9 AM - 11 AM", volunteers: ["John Doe", "Jane Smith"], pro:"0.6" },
          { label: "Volunteers", time: "1 PM - 3 PM", volunteers: ["David Johnson", "Emily Brown", "Michael Wilson"], pro:"0.3"  },
          { label: "Volunteers", time: "5 PM - 7 PM", volunteers: ["Sarah Miller", "Robert Jones", "Lisa Davis", "David Johnson", "Emily Brown", "Michael Wilson"], pro:"0.9"  }
        ]
      }
    ];

    return (
      <div className="shift-container">
        {mockShifts.map(shift => (
          <div key={shift.id} className="shift-row">
            {/* <h2>{shift.date}</h2> */}
            <div className="roaster-list">
              {shift.shifts.map((shiftData, index) => (
                <Roaster key={index} shiftDetails={shiftData} volunteers={shiftData.volunteers} pro={shiftData.pro}/>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default ShiftContainer;
