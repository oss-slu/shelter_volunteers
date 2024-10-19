import React from 'react'; 
import { shiftListed } from './shiftsListed.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/ShiftsModal.css"
import { ModalComponent } from './ModalComponent';

export const ShiftsModal = props => {
  const {isVolunteerModalOpen, setIsVolunteerModalOpen} = props;
  const volunteerShifts = shiftListed;

  const sendEmail = email => {
    console.log(email);
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
        <p>{"Date: " + volunteerShifts.shift.date}</p>
        <p>{"Shift: " + volunteerShifts.shift.name ?
          volunteerShifts.shift.name + ": " + volunteerShifts.shift.startTime + " - " + volunteerShifts.shift.endTime 
          : volunteerShifts.shift.startTime + " - " + volunteerShifts.shift.endTime}</p>
        <p>{"Current Volunteer Count: " + volunteerShifts.shift.currentVolunteers}</p>
        <p>{"Required Volunteer Count: " + volunteerShifts.shift.requiredVolunteers}</p>
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