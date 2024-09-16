import React from 'react'; 
import Modal from 'react-modal';
import { shiftListed } from './shiftsListed.tsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

export const VolunteerDetailsModal = props => {
  const [volunteerShifts, setVolunteerShifts] = React.useState([shiftListed]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const emailButton = shift => {
    return (
      <button>
        <FontAwesomeIcon icon={faEnvelope} size="1x" class="fa-solid fa-envelope" />
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
      > 
        <h3>Signed-Up Volunteers</h3>
        <table>
          <thead>
            <tr>
              <td>Volunteers Signed Up</td>
              <td>Date</td>
              <td>Shift Start Time</td>
              <td>Shift End Time</td>
              <td>Send E-mail</td>
            </tr>
          </thead>
          <tbody>
            {renderShifts()}
          </tbody>
        </table>

      </Modal>
    </div>
  )
}