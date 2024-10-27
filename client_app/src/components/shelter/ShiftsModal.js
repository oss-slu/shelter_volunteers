import React from 'react'; 
import { shiftListed } from './shiftsListed.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/ShiftsModal.css"
import { ModalComponent } from './ModalComponent';
import { ENVIROMENT } from '../../config.js';
import { format } from "date-fns";

export const ShiftsModal = props => {
  const {isVolunteerModalOpen, setIsVolunteerModalOpen} = props;
  const volunteerShifts = shiftListed;

  const sendEmail = email => {
    if (ENVIROMENT === "development") {
      console.log(email); //Todo
    }
  }

  const emailButton = shift => {
    return (
      <button className="emailButton" onClick={() => sendEmail(shift.email)}>
        <FontAwesomeIcon icon={faEnvelope} size="1x" className="emailIcon" />
      </button>
    )
  }

  const renderShifts = () => {
    return (volunteerShifts.volunteers.map((shift => {
      return (
        <tr key={shift.id}>
          <td>{shift.name}</td>
          <td>{shift.phoneNumber.slice(0,3) + "-" + shift.phoneNumber.slice(3,6) + "-" + shift.phoneNumber.slice(6)}</td>
          <td>{shift.email}</td>
          <td>{emailButton(shift)}</td>
        </tr>
      )
    })))
  }

  const renderData = () => {
    return (
      <div>
        <span className="modalHeading">
          <h3>
            Signed-Up Volunteers
          </h3>
        </span>
        <div className="overallShiftDetails">
          <div className="dateAndShiftInfo">
            <p><b>Date: </b>{format(volunteerShifts.shift.startTime, "MM/dd/yyyy")}</p>
            <p><b>Shift: </b>{volunteerShifts.shift.name ?
            volunteerShifts.shift.name + ": " + format(volunteerShifts.shift.startTime, "hh:mm aaaaa'm'") + " - " + format(volunteerShifts.shift.endTime, "hh:mm aaaaa'm'") 
            : format(volunteerShifts.shift.startTime, "hh:mm aaaaa'm'") + " - " + format(volunteerShifts.shift.endTime, "hh:mm aaaaa'm'")}</p>
          </div>
          <div className="volunteerCountInfo">
            <p><b>Current Volunteer Count: </b>{volunteerShifts.shift.currentVolunteers}</p>
            <p><b>Required Volunteer Count: </b>{volunteerShifts.shift.requiredVolunteers}</p>
          </div>
        </div>
        <div className="shiftsTableContainer">
          <table className="shiftsTable">
            <thead className="shiftsTableHeader">
              <tr>
                <th>Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Send E-mail</th>
              </tr>
            </thead>
            <tbody className="shiftsTableBody">
              {renderShifts()}
            </tbody>
          </table>
        </div>
      </div>
    ) 
  }

  return (
    <ModalComponent
      isOpen={isVolunteerModalOpen}
      onRequestClose={() => setIsVolunteerModalOpen(false)}
      renderData={renderData}
    /> 
  )
}