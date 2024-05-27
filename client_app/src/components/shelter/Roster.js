import React, { Component } from "react";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import "../../styles/shelter/Roster.css";

class Roster extends Component {
  render() {
    const { shiftDetails, volunteers, pro } = this.props;
    const volunteerCount = volunteers.length;

    return (
      <div className="roster-item-container">
        <progress value={pro} className="full-width-progress" />
        <div className="roster-item">
          <PeopleAltIcon />
          <span>
            {volunteerCount} {shiftDetails.label}
          </span>
          <span>{shiftDetails.time}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {volunteers.map((volunteer, index) => (
            <span key={index}>{volunteer}</span>
          ))}
        </div>
      </div>
    );
  }
}

export default Roster;
