import React from 'react'; 
import { ModalComponent } from './ModalComponent';
import { ENVIROMENT } from '../../config.js';

export const EditStatusConfirmationModal = props => {
  const {isStatusModalOpen, setIsStatusModalOpen, shift} = props;

  const onYesClick = () => {
    if (ENVIROMENT === "development") {
      console.log("changed shift status to: " + !shift.status); //Todo
    }
    setIsStatusModalOpen(false);
  }

  const onNoClick = () => {
    setIsStatusModalOpen(false);
  }

  const renderData = () => {
    return (
      <div>
        <p> Do you want to {!shift.status ? "open" : "close"} volunteer shift registration on {shift.date} from {shift.startTime} to {shift.endTime}? </p>
        <button onClick={() => onYesClick()}>
          Yes
        </button>
        <button onClick={() => onNoClick()}>
          No
        </button>
      </div>
    ) 
  }

  return (
    <ModalComponent
      isOpen={isStatusModalOpen}
      onRequestClose={() => setIsStatusModalOpen(false)}
      renderData={renderData}
    /> 
  )
}