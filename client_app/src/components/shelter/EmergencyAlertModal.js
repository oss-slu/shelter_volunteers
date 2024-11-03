import React, {useState} from 'react'; 
import { ModalComponent } from './ModalComponent';
import { ENVIROMENT } from '../../config.js';
import "../../styles/shelter/emergencyAlertModal.css"

export const EmergencyAlertModal = props => {
  const {isEmergencyModalOpen, setIsEmergencyModalOpen} = props;
  const [containsMessage, setContainsMessage] = useState(false)
  const [input, setInput] = useState("");

  const sendAlert = () => {
    if (ENVIROMENT === "development") {
      console.log(input); //Todo
    }
    setIsEmergencyModalOpen(false);
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
            Emergency Alert
          </h3>
        </span>
        <div className="emergencyMessageContainer">
          <textarea
              type="text"
              value={input}
              onChange={(e) => handleChange(e.target.value)}
              className="emergencyMessage"
          />
        </div>
        <div className="sendButtonContainer">
          <button className="sendButton" disabled={!containsMessage} onClick={() => sendAlert()}>
            Send
          </button>
        </div>
      </div>
    ) 
  }

  return (
    <ModalComponent
      isOpen={isEmergencyModalOpen}
      onRequestClose={() => setIsEmergencyModalOpen(false)}
      renderData={renderData}
    /> 
  )
}