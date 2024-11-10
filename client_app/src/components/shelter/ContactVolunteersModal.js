import React, {useState} from 'react'; 
import { ModalComponent } from './ModalComponent';
import { ENVIROMENT } from '../../config.js';
import "../../styles/shelter/ContactVolunteersModal.css"

export const ContactVolunteersModal = props => {
  const {isContactVolunteersModalOpen, setIsContactVolunteersModalOpen} = props;
  const [containsMessage, setContainsMessage] = useState(false)
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (ENVIROMENT === "development") {
      console.log(input); //Todo
    }
    setIsContactVolunteersModalOpen(false);
  }

  const handleChange = (value) => {
    setInput(value);
    if (value.length > 0) {
      setContainsMessage(true);
    } else {
      setContainsMessage(false);
    }
  }

  const renderData = () => {
    return (
      <div>
        <span className="modalHeading">
          <h3>
            Contact Volunteers
          </h3>
        </span>
        <div className="volunteerMessageContainer">
          <textarea
              type="text"
              value={input}
              onChange={(e) => handleChange(e.target.value)}
              className="volunteerMessage"
          />
        </div>
        <div className="sendButtonContainer">
          <button className="sendButton" disabled={!containsMessage} onClick={() => sendMessage()}>
            Send
          </button>
        </div>
      </div>
    ) 
  }

  return (
    <ModalComponent
      isOpen={isContactVolunteersModalOpen}
      onRequestClose={() => setIsContactVolunteersModalOpen(false)}
      renderData={renderData}
    /> 
  )
}