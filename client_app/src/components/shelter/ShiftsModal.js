import React from 'react'; 
import Modal from 'react-modal';
import { shiftListed } from './shiftsListed.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import "../../styles/shelter/ShiftsModal.css"

export const ShiftsModal = props => {
  const [volunteerShifts, setVolunteerShifts] = React.useState([shiftListed]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

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

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>Open modal</button>
      <Modal 
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Signed-Up Volunteers"
        className="shiftsModal"
        ariaHideApp={false}
      > 
        <span className="modalHeading">
          <h3>
            Signed-Up Volunteers
            <button className="close-btn" onClick={()=>{setIsModalOpen(false)}}>
              <FontAwesomeIcon icon={faCircleXmark} className="closeIcon"/>
            </button>
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

      </Modal>
    </div>
  )
}