import React from 'react'; 
import Modal from 'react-modal';

export const VolunteerDetailsModal = props => {
  const [volunteerShifts, setVolunteerShifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button onClick={setIsModalOpen(!isModalOpen)}>Open modal</Button>
      <Modal 
        isOpen={isModalOpen}
        onRequestClose={setIsModalOpen(false)}
        contentLabel="Signed-Up Volunteers"
      > 
      HelloWorld

      </Modal>
    </div>
    

  )
}