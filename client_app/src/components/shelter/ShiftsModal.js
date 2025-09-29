import React from "react";
import "../../styles/shelter/ShiftsModal.css";
import { ModalComponent } from "./ModalComponent";

export const ShiftsModal = ({ isOpen, onClose, shift }) => {
  const renderVolunteers = () => {
    return shift.volunteers.map((volunteer, index) => (
      <tr key={index}>
        <td>{volunteer.name}</td>
        <td>{volunteer.phoneNumber}</td>
        <td>{volunteer.email}</td>
      </tr>
    ));
  };

  const renderData = () => {
    if (!shift) {
      return null;
    }
    return (
      <div>
        <span className="modalHeading">
          <h3>Signed-Up Volunteers</h3>
        </span>
        <div className="overallShiftDetails">
          <div className="dateAndShiftInfo">
            <p>Date and Time Info</p>
          </div>
          <div className="volunteerCountInfo">
            <p>
              <b>Current Volunteer Count: </b>
              {shift.volunteers.length}
            </p>
            <p>
              <b>Required Volunteer Count: </b>
              {shift.required_volunteer_count}
            </p>
          </div>
        </div>
        <div className="shiftsTableContainer">
          <table className="shiftsTable">
            <thead className="shiftsTableHeader">
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody className="shiftsTableBody">{renderVolunteers()}</tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <ModalComponent isOpen={isOpen} onRequestClose={() => onClose(false)} renderData={renderData} />
  );
};
