import React from 'react'; 
import { shiftListed } from './shiftsListed.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/ShiftsModal.css"
import { ModalComponent } from './ModalComponent';

export const ShiftsModal = props => {
  const {isVolunteerModalOpen, setIsVolunteerModalOpen} = props;
  const volunteerShifts = [shiftListed];

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
    return (volunteerShifts.map((shift => {
      return (
        <tr key={shift.id}>
          <td>{shift.name}</td>
          <td>{shift.date}</td>
          <td>{shift.startTime}</td>
          <td>{shift.endTime}</td>
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
        <table className="shiftsTable">
          <thead className="shiftsTableHeader">
            <tr>
              <td>Volunteers Signed Up</td>
              <td>Date</td>
              <td>Shift Start Time</td>
              <td>Shift End Time</td>
              <td>Send E-mail</td>
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